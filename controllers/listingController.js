/**
 * GET /api/listings/property/:id
 * Returns a single property by its ID
 */
export const getPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    // Fetch all listings (could be optimized for large datasets)
    const headers = {
      Authorization:
        'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
      Accept: 'application/json',
    };
    const apiLimit = 1000;
    let allListings = [];
    let offset = 0;
    let total = 0;
    let first = true;
    do {
      const pageURL = `https://partners.api.kw.com/v2/listings/region/50394?page[offset]=${offset}&page[limit]=${apiLimit}`;
      const pageRes = await axios.get(pageURL, { headers });
      const hits = pageRes.data?.hits?.hits ?? [];
      allListings = allListings.concat(hits.map(hit => ({
        ...hit._source,
        _kw_meta: { id: hit._id, score: hit._score ?? null },
      })));
      if (first) {
        total = pageRes.data?.hits?.total?.value ?? 0;
        first = false;
      }
      offset += apiLimit;
    } while (offset < total);

    // Ensure each listing has a stable id before any filtering/pagination and
    // assign a deterministic numeric index so pagination slices are stable.
    const stableId = (item) => {
      const s = `${item._kw_meta?.id || ''}|${item.list_address?.address || item.address || ''}|${item.title || item.prop_type || ''}|${item.current_list_price || item.price || item.rental_price || ''}|${item.list_dt || ''}`;
      let h = 5381;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) + s.charCodeAt(i);
        h = h & h; // keep as 32-bit int
      }
      return `gen-${Math.abs(h)}`;
    };

    allListings = allListings.map(item => {
      item._kw_meta = item._kw_meta || {};
      if (!item._kw_meta.id && !item.id) {
        const id = stableId(item);
        item.id = id;
        item._kw_meta.id = id;
      } else if (!item.id && item._kw_meta?.id) {
        item.id = item._kw_meta.id;
      } else if (!item._kw_meta?.id && item.id) {
        item._kw_meta.id = item.id;
      }
      return item;
    });

    // Sort deterministically by id so pagination slices are stable across requests.
    allListings.sort((a, b) => {
      const A = String(a._kw_meta?.id || a.id || '');
      const B = String(b._kw_meta?.id || b.id || '');
      return A.localeCompare(B);
    });

    // Assign a stable numeric index so clients can rely on offset pagination.
    allListings = allListings.map((it, idx) => ({ ...it, stable_index: idx }));

    // store in cache (overwrite with enriched items)
    externalListingsCache.ts = Date.now();
    externalListingsCache.data = allListings.slice();

    // Find the property by ID
    const foundProperty = allListings.find(
      prop => String(prop._kw_meta?.id) === String(propertyId) || String(prop.id) === String(propertyId)
    );
    if (foundProperty) {
      return res.json({ success: true, data: foundProperty });
    } else {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
  } catch (err) {
    const status = err.response?.status ?? 500;
    const message = err.response?.data ?? err.message;
    console.error('KW API Error:', message);
    return res.status(status).json({
      success: false,
      message: 'Failed to fetch property by ID',
      error: message,
    });
  }
};

/** ------------------------------------------------------------------
 *  GET  or  POST   /api/get-external-listings
 *  Params / Body:
 *    page          (int, default 1)
 *    limit         (int, default 100)
 *    market_center (string / int, optional)
 *    list_category (string, optional)
 * ----------------------------------------------------------------- */
import axios from 'axios';
import util  from 'util';   // optional, for deep debug prints

// Simple in-memory cache to stabilize repeated listing requests during
// short test cycles. This keeps the fetched external listings for a
// short TTL so paginated requests made in quick succession see the
// same underlying dataset.
const externalListingsCache = {
  ts: 0,
  data: [],
  ttl: 60 * 1000, // 60 seconds
};






export const getExternalListings = async (req, res) => {
  try {
    // 1. Get pagination and filter input from request
    const page = Number(req.body.page ?? req.query.page ?? 1);
    const perPage = Number(req.body.limit ?? req.query.limit ?? 50);
    const marketCenterFilter = req.body.market_center ?? req.query.market_center;
    const listCategoryFilter = req.body.list_category ?? req.query.list_category;
    const propertyCategoryFilter = req.body.property_category ?? req.query.property_category;
    const propertySubtypeFilter = req.body.property_subtype ?? req.query.property_subtype;
    const locationFilter = req.body.location ?? req.query.location;
    const minPrice = req.body.min_price ?? req.query.min_price;
    const maxPrice = req.body.max_price ?? req.query.max_price;
    const propertyType = req.body.property_type ?? req.query.property_type;
    
    // New optional filters
    const forSale = req.body.forsale ?? req.query.forsale;
    const forRent = req.body.forrent ?? req.query.forrent;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page number must be greater than 0',
        error: 'Invalid page parameter'
      });
    }
    
    if (perPage < 1 || perPage > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Per page limit must be between 1 and 1000',
        error: 'Invalid per_page parameter'
      });
    }

    // 2. Set up headers for API
    const headers = {
      Authorization:
        'Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==',
      Accept: 'application/json',
    };

    // 3. Fetch all listings from the API (loop through all pages)
    let allListings = [];
    // Use cached data when available and fresh to avoid variations
    // across rapid paginated requests.
    const now = Date.now();
    if (externalListingsCache.ts && (now - externalListingsCache.ts) < externalListingsCache.ttl) {
      allListings = externalListingsCache.data.slice();
    } else {
      let offset = 0;
      const apiLimit = 1000; // Use the largest allowed by the KW API
      let total = 0;
      let first = true;
      do {
        const pageURL = `https://partners.api.kw.com/v2/listings/region/50394?page[offset]=${offset}&page[limit]=${apiLimit}`;
        const pageRes = await axios.get(pageURL, { headers });
        const hits = pageRes.data?.hits?.hits ?? [];
        allListings = allListings.concat(hits.map(hit => ({
          ...hit._source,
          _kw_meta: { id: hit._id, score: hit._score ?? null },
        })));
        if (first) {
          total = pageRes.data?.hits?.total?.value ?? 0;
          first = false;
        }
        offset += apiLimit;
      } while (offset < total);

      // store in cache
      externalListingsCache.ts = Date.now();
      externalListingsCache.data = allListings.slice();
    }

    // 4. Apply strict filtering - REMOVE unwanted listings completely
    // Use the cached enriched data directly when available
    if (externalListingsCache.ts && externalListingsCache.data && externalListingsCache.data.length > 0) {
      allListings = externalListingsCache.data.slice();
    }
    // Define exactly what we want to KEEP
    const allowedListStatuses = ['Active', 'Sold', 'Rented/Leased'];
    const allowedListCategories = ['For Sale', 'For Rent', 'To Let', 'Sold', 'Rented/Leased'];
    
    // Define what we want to EXCLUDE (remove completely)
    const blockedStatuses = ['Expired', 'Pending', 'Withdrawn', 'Cancelled', 'Off Market'];
    const blockedCategories = ['Off Market', 'Pending', 'Withdrawn', 'Cancelled', 'Expired'];

    // Filter out listings that match blocked statuses or blocked categories only
    allListings = allListings.filter(item => {
      // Get all possible status fields
      const listStatus = (item.list_status || '').toString();
      const status = (item.status || '').toString();
      const propertyStatus = (item.property_status || '').toString();

      // Get all possible category fields
      const listCategory = (item.list_category || '').toString();
      const category = (item.category || '').toString();

      // If any of the status fields match blocked statuses, exclude
      const hasBlockedStatus = blockedStatuses.some(blocked =>
        listStatus === blocked || status === blocked || propertyStatus === blocked
      );

      // If any of the category fields match blocked categories, exclude
      const hasBlockedCategory = blockedCategories.some(blocked =>
        listCategory === blocked || category === blocked
      );

      // Exclude only when blocked values are present
      if (hasBlockedStatus || hasBlockedCategory) return false;

      // Otherwise keep the listing
      return true;
    });

    // 5. Apply new optional filters
    
    // Debug: Log the filter values
    console.log('Filter values received:', {
      forSale,
      forRent,
      propertyType,
      minPrice,
      maxPrice,
      locationFilter,
      propertySubtypeFilter
    });
    
    // Debug: Log sample properties before filtering
    if (allListings.length > 0) {
      console.log('=== SAMPLE PROPERTIES BEFORE FILTERING ===');
      allListings.slice(0, 3).forEach((item, idx) => {
        console.log(`Property ${idx + 1}:`, {
          id: item._kw_meta?.id,
          list_category: item.list_category,
          category: item.category,
          prop_type: item.prop_type,
          city: item.list_address?.city
        });
      });
      console.log('=== END DEBUG ===');
    }
    
    // 1) For Sale filter - if forsale is true, only show "For Sale" listings
    if (forSale === 'true' || forSale === true) {
      console.log('Applying For Sale filter');
      allListings = allListings.filter(item => {
        const raw = item.list_category || item.category || '';
        const category = String(raw).toLowerCase();
        const matches = category.includes('sale');
        if (item._kw_meta?.id) {
          console.log(`Property ${item._kw_meta.id}: list_category="${raw}" (${category}) - matches sale: ${matches}`);
        }
        return matches;
      });
      console.log(`After For Sale filter: ${allListings.length} properties`);
    }
    
    // 2) For Rent filter - if forrent is true, only show "For Rent" listings  
    if (forRent === 'true' || forRent === true) {
      console.log('Applying For Rent filter');
      allListings = allListings.filter(item => {
        const raw = item.list_category || item.category || '';
        const category = String(raw).toLowerCase();
        const matches = category.includes('rent') || category.includes('lease') || category.includes('let');
        if (item._kw_meta?.id) {
          console.log(`Property ${item._kw_meta.id}: list_category="${raw}" (${category}) - matches rent: ${matches}`);
        }
        return matches;
      });
      console.log(`After For Rent filter: ${allListings.length} properties`);
    }
    
    // 3) Property Type filter - support any property type, flexible match
    if (propertyType) {
      console.log('Applying Property Type filter:', propertyType);
      const typeFilter = propertyType.toLowerCase().replace(/[_ ]/g, '');
      allListings = allListings.filter(item => {
        const propType = (item.prop_type || item.property_type || '').toString().toLowerCase().replace(/[_ ]/g, '');
        const matches = propType.includes(typeFilter);
        if (item._kw_meta?.id) {
          console.log(`Property ${item._kw_meta.id}: prop_type="${item.prop_type}" (${propType}) - matches ${propertyType}: ${matches}`);
        }
        return matches;
      });
      console.log(`After Property Type filter: ${allListings.length} properties`);
    }
    
    // 4) Price range filters on current_list_price
    // Backend price filtering using current_list_price, price, or rental_price
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = minPrice !== undefined && minPrice !== '' ? parseFloat(String(minPrice).replace(/,/g, '')) : 0;
      const max = maxPrice !== undefined && maxPrice !== '' ? parseFloat(String(maxPrice).replace(/,/g, '')) : Infinity;
      allListings = allListings.filter(item => {
        let price = null;
        const priceFields = [item.current_list_price, item.price, item.rental_price];
        for (let val of priceFields) {
          if (val !== undefined && val !== null && val !== '') {
            price = parseFloat(String(val).replace(/,/g, ''));
            if (!isNaN(price)) break;
          }
        }
        if (price === null || isNaN(price)) price = 0;
        return price >= min && price <= max;
      });
    }

    // 6. Apply additional filters if provided
    // Sort by year_built descending if include_new_homes is true
    const includeNewHomes = req.body.include_new_homes ?? req.query.include_new_homes;
    if (includeNewHomes === true || includeNewHomes === 'true') {
      allListings = allListings.sort((a, b) => {
        const dateA = new Date(a.year_built);
        const dateB = new Date(b.year_built);
        return dateB - dateA;
      });
    }
    if (marketCenterFilter !== undefined) {
      const mc = String(marketCenterFilter);
      const FIELD_CANDIDATES = [
        'listing_market_center',
        'office_mls_id',
        'market_center',
      ];
      allListings = allListings.filter(item =>
        FIELD_CANDIDATES.some(
          key => item[key] !== undefined && String(item[key]) === mc
        )
      );
    }
    if (listCategoryFilter !== undefined) {
      const lc = String(listCategoryFilter).toLowerCase();
      allListings = allListings.filter(item => {
        const val = item.list_category || item.status || item.property_status || '';
        return String(val).toLowerCase() === lc;
      });
    }
    // New: property_category filter
    if (propertyCategoryFilter !== undefined) {
      const pc = String(propertyCategoryFilter).toLowerCase();
      allListings = allListings.filter(item => {
        const val = item.prop_type || '';
        return String(val).toLowerCase() === pc;
      });
    }
    // New: property_subtype filter
    if (propertySubtypeFilter !== undefined) {
      const ps = String(propertySubtypeFilter).toLowerCase();
      allListings = allListings.filter(item => {
        const val = item.prop_subtype || item.subtype || '';
        return String(val).toLowerCase() === ps;
      });
    }
    // New: location filter
   if (locationFilter !== undefined) {
  const loc = String(locationFilter).toLowerCase();

  allListings = allListings.filter(item => {
    const city = item.list_address?.city ?? '';
    return city.toLowerCase().includes(loc);
  });
}





    // 7. Calculate pagination details
  // Debug: Log total properties after filtering and before pagination
  console.log('Total properties after all filters (before pagination):', allListings.length);
    const totalFiltered = allListings.length;
    const totalPages = Math.ceil(totalFiltered / perPage);
    
    // Debug: Log final results
    console.log('=== FILTERING RESULTS ===');
    console.log(`Total properties after all filters: ${totalFiltered}`);
    console.log(`Applied filters:`, {
      forSale: forSale === 'true' || forSale === true,
      forRent: forRent === 'true' || forRent === true,
      propertyType,
      minPrice,
      maxPrice,
      locationFilter,
      propertySubtypeFilter
    });
    console.log('=== END RESULTS ===');
    
    // Check if requested page exceeds total pages
    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({
        success: false,
        message: `Page ${page} does not exist. Total pages available: ${totalPages}`,
        error: 'Page out of range',
        total_pages: totalPages,
        total: totalFiltered
      });
    }

    // 8. Paginate filtered results
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginated = allListings.slice(startIndex, endIndex);

    // 9. Return response with comprehensive pagination info
    return res.json({
      success: true,
      pagination: {
        current_page: page,
        per_page: perPage,
        total_items: totalFiltered,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
        start_index: startIndex + 1,
        end_index: Math.min(endIndex, totalFiltered)
      },
      count: paginated.length,
      data: paginated,
    });
  } catch (err) {
    const status = err.response?.status ?? 500;
    const message = err.response?.data ?? err.message;
    console.error('KW API Error:', message);
    return res.status(status).json({
      success: false,
      message: 'Failed to fetch listings',
      error: message,
    });
  }


  
};




export const getFilteredListings = async (req, res) => {
  try {
    const { offset = 0, limit = 20 } = req.query;

    const headers = {
      Authorization:
        "Basic b2FoNkRibjE2dHFvOE52M0RaVXk0NHFVUXAyRjNHYjI6eHRscnJmNUlqYVZpckl3Mg==",
      Accept: "application/json",
    };

    const apiLimit = 1000;
    let allListings = [];
    let apiOffset = 0;
    let total = 0;
    let first = true;

    // 🔄 Fetch all listings from KW API
    do {
      const pageURL = `https://partners.api.kw.com/v2/listings/region/50394?page[offset]=${apiOffset}&page[limit]=${apiLimit}`;
      const pageRes = await axios.get(pageURL, { headers });
      const hits = pageRes.data?.hits?.hits ?? [];

      allListings = allListings.concat(
        hits.map((hit) => ({
          ...hit._source,
          _kw_meta: { id: hit._id, score: hit._score ?? null },
        }))
      );

      if (first) {
        total = pageRes.data?.hits?.total?.value ?? 0;
        first = false;
      }
      apiOffset += apiLimit;
    } while (apiOffset < total);

    // 🔑 Stable ID generator
    const stableId = (item) => {
      const s = `${item._kw_meta?.id || ""}|${
        item.list_address?.address || item.address || ""
      }|${item.title || item.prop_type || ""}|${
        item.current_list_price ||
        item.price ||
        item.rental_price ||
        ""
      }|${item.list_dt || ""}`;
      let h = 5381;
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) + h + s.charCodeAt(i);
        h = h & h;
      }
      return `gen-${Math.abs(h)}`;
    };

    // ✅ Normalize IDs
    allListings = allListings.map((item) => {
      item._kw_meta = item._kw_meta || {};
      if (!item._kw_meta.id && !item.id) {
        const id = stableId(item);
        item.id = id;
        item._kw_meta.id = id;
      } else if (!item.id && item._kw_meta?.id) {
        item.id = item._kw_meta.id;
      } else if (!item._kw_meta?.id && item.id) {
        item._kw_meta.id = item.id;
      }
      return item;
    });

    // ✅ Sort for stable pagination
    allListings.sort((a, b) => {
      const A = String(a._kw_meta?.id || a.id || "");
      const B = String(b._kw_meta?.id || b.id || "");
      return A.localeCompare(B);
    });

    // ✅ Assign stable index
    allListings = allListings.map((it, idx) => ({
      ...it,
      id: it.id || it._kw_meta?.id, // 🔑 guarantee top-level id
      stable_index: idx,
    }));

    // ✅ Filter: only Active + (For Sale or Off Market)
    const filteredListings = allListings.filter((item) => {
      const category = String(item.list_category || item.category || "").toLowerCase();
      const status = String(item.list_status || "").toLowerCase();

      const isActive = status === "active";
      const isForSale = category.includes("sale");
      const isOffMarket = category.includes("off market");

      return isActive && (isForSale || isOffMarket);
    });

    // ✅ Pagination
   
    

   

    const start = parseInt(offset, 10) || 0;
const parsedLimit = String(limit).toLowerCase() === "all" ? null : parseInt(limit, 10) || 20;
const end = parsedLimit ? start + parsedLimit : filteredListings.length;

let paginated;

if (!parsedLimit) {
  // return all
  paginated = filteredListings.map((item) => ({
    ...item,
    id: item.id,
  }));
} else {
  // return paginated
  paginated = filteredListings.slice(start, end).map((item) => ({
    ...item,
    id: item.id,
  }));
}

return res.json({
  success: true,
  total: filteredListings.length,
  offset: start,
  limit: parsedLimit || "all",
  data: paginated,
});
  } catch (err) {
    const status = err.response?.status ?? 500;
    const message = err.response?.data ?? err.message;
    console.error("KW API Error:", message);
    return res.status(status).json({
      success: false,
      message: "Failed to fetch filtered listings",
      error: message,
    });
  }
};



