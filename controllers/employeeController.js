import Employee from "../models/employee.js";

// ✅ Create employee with profile image
export const createEmployee = async (req, res) => {
  try {
    const { name, jobTitle, email, phone, team } = req.body;

    const profileImage = req.files?.profileImage?.[0]?.path || null;

    const employee = new Employee({
      name,
      jobTitle,
      email,
      phone,
      team,
      profileImage
    });

    await employee.save();
    res.status(201).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get employees by team
export const getEmployeesByTeam = async (req, res) => {
  try {
    const { team } = req.params;
    const employees = await Employee.find({ team });
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update employee (with profile image)
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = { ...req.body };
    if (req.files?.profileImage) {
      updatedData.profileImage = req.files.profileImage[0].path;
    }

    const employee = await Employee.findByIdAndUpdate(id, updatedData, { new: true });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
