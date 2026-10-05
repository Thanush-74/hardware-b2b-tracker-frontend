import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  InputAdornment,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
} from '@mui/material';
import { getStaff, createStaff, updateStaffStatus } from '../services/staffService';
import { getRoles } from '../services/roleService';
import { StaffIcon } from '../components/Icons';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [staffData, rolesData] = await Promise.all([getStaff(), getRoles()]);
      setStaffList(staffData?.staff || staffData || []);
      setRoles(rolesData || []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load staff list and roles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = 'First Name is required';
    if (!lastName.trim()) errors.lastName = 'Last Name is required';
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (!roleId) errors.roleId = 'Please select a role for this employee';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const created = await createStaff({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role_id: roleId,
      });

      const roleObj = roles.find((r) => Number(r.id) === Number(roleId));
      setSubmitSuccess(
        `Employee "${created.first_name} ${created.last_name}" created successfully with role "${roleObj?.name || 'Assigned Role'}"!`
      );

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRoleId('');
      setFormErrors({});

      const refreshedStaff = await getStaff();
      setStaffList(refreshedStaff?.staff || refreshedStaff || []);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create employee. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffMember) => {
    setStatusUpdatingId(staffMember.id);
    try {
      const updated = await updateStaffStatus(staffMember.id, !staffMember.is_active);
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffMember.id ? { ...s, is_active: updated.is_active } : s))
      );
    } catch (err) {
      alert(err.message || 'Failed to update employee status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StaffIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Staff & Employee Management
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Create employee accounts and assign existing RBAC roles (POST /api/staff, GET /api/roles)
            </Typography>
          </Box>
        </Stack>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 3.5, alignItems: 'start' }}>
          <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#0f172a' }}>
                Create Employee
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                New accounts automatically receive screen access matching their selected role.
              </Typography>

              {submitSuccess && (
                <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSubmitSuccess('')}>
                  {submitSuccess}
                </Alert>
              )}

              {submitError && (
                <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setSubmitError('')}>
                  <AlertTitle>Creation Failed</AlertTitle>
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    id="staff-first-name"
                    label="First Name"
                    placeholder="John"
                    fullWidth
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: null });
                    }}
                    error={Boolean(formErrors.firstName)}
                    helperText={formErrors.firstName}
                    disabled={isSubmitting}
                  />
                  <TextField
                    id="staff-last-name"
                    label="Last Name"
                    placeholder="Doe"
                    fullWidth
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: null });
                    }}
                    error={Boolean(formErrors.lastName)}
                    helperText={formErrors.lastName}
                    disabled={isSubmitting}
                  />
                </Box>

                  <TextField
                    id="staff-email"
                    label="Email Address"
                    placeholder="john.doe@company.com"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                    }}
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                    disabled={isSubmitting}
                  />

                  <TextField
                    id="staff-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors({ ...formErrors, password: null });
                    }}
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth required error={Boolean(formErrors.roleId)}>
                    <InputLabel id="role-select-label">Assign Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      id="role-select"
                      value={roleId}
                      label="Assign Role *"
                      onChange={(e) => {
                        setRoleId(e.target.value);
                        if (formErrors.roleId) setFormErrors({ ...formErrors, roleId: null });
                      }}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="" disabled>
                        <em>Select an existing role</em>
                      </MenuItem>
                      {roles.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span>{r.name}</span>
                            <Chip
                              label={r.slug}
                              size="small"
                              sx={{
                                ml: 1,
                                height: 18,
                                fontSize: '0.65rem',
                                fontFamily: 'monospace',
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.roleId && <FormHelperText>{formErrors.roleId}</FormHelperText>}
                  </FormControl>

                  <Button
                    id="create-staff-btn"
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      mt: 1,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CircularProgress size={18} sx={{ color: '#ffffff' }} />
                        <span>Creating Employee...</span>
                      </Stack>
                    ) : (
                      'Create Employee'
                    )}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Staff Accounts ({staffList.length})
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Staff members and their assigned RBAC roles
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={fetchData} sx={{ textTransform: 'none', borderColor: '#d1d5db', color: '#0f172a' }}>
                Refresh
              </Button>
            </Box>

            <TableContainer
              sx={{
                flexGrow: 1,
                maxHeight: 600,
                width: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { height: '5px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '4px' },
              }}
            >
              <Table size="small" sx={{ minWidth: 550 }}>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0' } }}>
                      <TableCell>Staff Member</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffList.map((member) => (
                      <TableRow
                        key={member.id}
                        sx={{
                          '&:hover': { backgroundColor: '#f8fafc' },
                          '& td': { borderColor: '#f1f5f9' },
                        }}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {member.first_name} {member.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                            {member.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={member.role?.name || member.role?.slug || 'Staff'}
                            size="small"
                            sx={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={member.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={member.is_active ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Button
                            size="small"
                            variant="text"
                            color={member.is_active ? 'error' : 'success'}
                            onClick={() => handleToggleStatus(member)}
                            disabled={statusUpdatingId === member.id}
                            sx={{ fontSize: '0.72rem', textTransform: 'none', py: 0.2 }}
                          >
                            {statusUpdatingId === member.id ? (
                              <CircularProgress size={14} />
                            ) : member.is_active ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
        </Box>
      )}
    </Box>
  );
};

export default StaffManagementPage;
