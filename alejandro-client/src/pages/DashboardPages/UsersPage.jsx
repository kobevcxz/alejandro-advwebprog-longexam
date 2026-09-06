import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, updateUser, createUser } from '../../services/UserService';
import { useAuth } from '../../context/AuthContext';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  MenuItem,
  Stack,
  Switch,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { DataGrid } from '@mui/x-data-grid';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    role: 'buyer',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const roles = ['admin', 'seller', 'buyer'];

  const labelize = (value) =>
    (value || '').charAt(0).toUpperCase() + (value || '').slice(1);

  const safeUsers = Array.isArray(users) ? users : [];

  // Metrics calculations
  const totalUsers = safeUsers.length;
  const adminCount = safeUsers.filter(u => (u.role || u.type || '').toLowerCase() === 'admin').length;
  const sellerCount = safeUsers.filter(u => (u.role || u.type || '').toLowerCase() === 'seller').length;
  const buyerCount = safeUsers.filter(u => (u.role || u.type || '').toLowerCase() === 'buyer').length;

  const filteredUsers = safeUsers.filter((u) => {
    const matchesSearch =
      `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.username || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const userRole = (u.role || u.type || u.userRole || 'buyer').toLowerCase();
    const matchesRole = filterRole ? userRole === filterRole.toLowerCase() : true;

    const matchesStatus =
      filterStatus === ""
        ? true
        : filterStatus === "active"
        ? u.isActive !== false
        : u.isActive === false;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
      const rawData = response?.data;
      const userArray = Array.isArray(rawData) 
        ? rawData 
        : (rawData?.data || rawData?.users || rawData?.results || []);
      
      setUsers(Array.isArray(userArray) ? userArray : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpen = () => {
    setIsEditing(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      contactNumber: '',
      address: '',
      role: 'buyer',
      isActive: true,
    });
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false); 
    setIsEditing(false); 
    setEditUserId(null);
    setErrors({});
  };

  const handleEdit = (id) => {
    const userToEdit = safeUsers.find((item) => (item._id || item.id) === id);
    if (userToEdit) {
      setNewUser({ ...userToEdit, password: '' });
      setEditUserId(id);
      setIsEditing(true);
      setErrors({});
      setOpen(true);
    }
  };

  const handleSaveUser = async () => {
    if (!validate()) return;

    try {
      if (isEditing) {
        const updatedUser = { ...newUser };
        if (!updatedUser.password) {
          delete updatedUser.password;
        }
        await updateUser(editUserId, updatedUser);
      } else {
        await createUser(newUser);
      }
      loadUsers();
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleToggleActive = async (id, isActive) => { 
    try {
      await updateUser(id, { isActive: !isActive });
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const columns1 = [
    {
      field: 'name',
      headerName: 'USER NAME',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => {
        const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim() || 'User';
        const email = params.row.email || 'No email';
        return (
          <div className="flex items-center gap-3 w-full py-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-zinc-900 text-sm">{fullName}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{email}</div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'role',
      headerName: 'ROLE',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const role = (params.row.role || params.row.type || 'buyer').toUpperCase();
        let badgeColor = 'bg-blue-50 text-blue-600 border-blue-100';
        if (role === 'ADMIN') badgeColor = 'bg-purple-50 text-purple-600 border-purple-200';
        if (role === 'SELLER') badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';

        return (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border tracking-wider ${badgeColor}`}>
            {role}
          </span>
        );
      },
    },
    {
      field: 'contactNumber',
      headerName: 'CONTACT',
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => (
        <span className="text-zinc-700 text-xs font-medium">
          {params.row.contactNumber || params.row.contact || params.row.phone || 'N/A'}
        </span>
      ),
    },
    {
      field: 'address',
      headerName: 'ADDRESS',
      flex: 1.3,
      minWidth: 180,
      renderCell: (params) => (
        <span className="text-zinc-600 text-xs truncate" title={params.row.address}>
          {params.row.address || 'N/A'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      flex: 1.1,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center gap-2 w-full justify-center">
          <button
            type="button"
            onClick={() => handleEdit(params.row._id || params.row.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition cursor-pointer"
          >
            Edit
          </button>

          <Switch
            checked={params.row.isActive !== false}
            onChange={() => handleToggleActive(params.row._id || params.row.id, params.row.isActive !== false)}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#2563eb" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2563eb" },
            }}
          />
        </div>
      ),
    },
  ];

  const inputField = (icon, props) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
      <Box sx={{ display: "flex", minWidth: 32, color: "text.secondary" }}>
        {icon}
      </Box>

      <TextField
        fullWidth
        size="small"
        {...props}
        error={!!errors[props.name]}
        helperText={errors[props.name]}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }, ...props.sx }}
        onChange={(e) => {
          setNewUser({ ...newUser, [props.name]: e.target.value });
          setErrors((prev) => ({ ...prev, [props.name]: "" }));
          props.onChange?.(e);
        }}
      />
    </Stack>
  );

  const validate = () => {
    const err = {};

    const firstName = newUser.firstName?.trim() || "";
    const lastName = newUser.lastName?.trim() || "";
    const email = newUser.email?.trim() || "";
    const password = newUser.password || "";
    const contact = newUser.contactNumber?.trim() || "";
    const address = newUser.address?.trim() || "";

    if (!firstName) err.firstName = "First name is required";
    if (!lastName) err.lastName = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) err.email = "Email is required";
    else if (!emailRegex.test(email))
      err.email = "Enter a valid email address";
    else {
      const emailExists = safeUsers.some((u) => {
        const sameEmail = u.email?.toLowerCase() === email.toLowerCase();
        if (isEditing) {
          return sameEmail && (u._id || u.id) !== editUserId;
        }
        return sameEmail;
      });

      if (emailExists) {
        err.email = "Email address is already in use";
      }
    }

    if (!isEditing) {
      if (!password) {
        err.password = "Password is required";
      } else if (password.length < 8) {
        err.password = "Password must be at least 8 characters";
      }
    } else if (password && password.length < 8) {
      err.password = "Password must be at least 8 characters";
    }

    const phoneRegex = /^09\d{9}$/;
    if (!contact) err.contactNumber = "Contact number is required";
    else if (!phoneRegex.test(contact))
      err.contactNumber = "Must start with 09 (11 digits)";

    if (!address) err.address = "Address is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage system accounts, roles, and access statuses.</p>
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2"
        >
          <AddCircleIcon fontSize="small" />
          Add User
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Users</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{totalUsers}</h2><p className="text-xs text-zinc-400 mt-0.5">All registered accounts</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Administrators</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{adminCount}</h2><p className="text-xs text-zinc-400 mt-0.5">System administrators</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sellers</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{sellerCount}</h2><p className="text-xs text-zinc-400 mt-0.5">Merchant store owners</p></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Buyers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
          </div>
          <div className="mt-4"><h2 className="text-2xl font-bold text-zinc-900">{buyerCount}</h2><p className="text-xs text-zinc-400 mt-0.5">Customer accounts</p></div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs gap-3">
        <TextField
          size="small"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 380, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <TextField
            select
            size="small"
            label="Role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {labelize(r)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-sm">User Directory</h3>
          <div className="text-xs font-semibold text-zinc-400">{filteredUsers.length} results</div>
        </div>

        <DataGrid
          rows={filteredUsers}
          columns={columns1}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={76}
          sx={{
            border: 'none',
            fontFamily: 'inherit',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              color: '#71717a',
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #e4e4e7',
            },
            '& .MuiDataGrid-cell': { borderColor: '#f4f4f5', display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#fafafa' },
          }}
        />
      </div>

      {/* Add / Edit User Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            border: "1px solid #e4e4e7",
          },
        }}
      >
        <DialogTitle className="font-bold text-zinc-900 border-b border-zinc-100">
          {isEditing ? "Edit User Account" : "Add New User Account"}
        </DialogTitle>

        <DialogContent className="space-y-4 pt-4 mt-2">
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {inputField(<PersonIcon />, {
                name: "firstName",
                label: "First Name",
                value: newUser.firstName,
              })}

              {inputField(<PersonIcon />, {
                name: "lastName",
                label: "Last Name",
                value: newUser.lastName,
              })}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {inputField(<PhoneIcon />, {
                name: "contactNumber",
                label: "Contact Number",
                value: newUser.contactNumber,
              })}

              {inputField(<EmailIcon />, {
                name: "email",
                label: "Email",
                value: newUser.email,
              })}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {inputField(<ManageAccountsIcon />, {
                select: true,
                name: "role",
                label: "Role",
                value: newUser.role || 'buyer',
                children: roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {labelize(role)}
                  </MenuItem>
                )),
              })}
            </Stack>

            {inputField(<LockIcon />, {
              name: "password",
              label: isEditing ? "Password (leave blank to keep current)" : "Password",
              type: showPassword ? "text" : "password",
              value: newUser.password,
              slotProps: {
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              },
            })}

            {inputField(<HomeIcon />, {
              name: "address",
              label: "Address",
              value: newUser.address,
              multiline: true,
              rows: 3,
            })}
          </Stack>
        </DialogContent>

        <DialogActions className="p-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveUser}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Create User'}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersPage;