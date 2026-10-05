import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
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
  Divider,
} from '@mui/material';
import { getScreens } from '../services/screenService';
import { getRoles, createRole } from '../services/roleService';
import { RolesIcon, getScreenIcon } from '../components/Icons';

const RoleManagementPage = () => {
  // Screens & Roles State
  const [screens, setScreens] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScreenIds, setSelectedScreenIds] = useState([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch screens and roles on component mount
  const fetchData = async () => {
    setIsLoadingData(true);
    setLoadError('');
    try {
      const [screensData, rolesData] = await Promise.all([getScreens(), getRoles()]);
      setScreens(screensData || []);
      setRoles(rolesData || []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load screens and roles from backend.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!slugManuallyEdited) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setSlug(generatedSlug);
    }
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const handleSlugChange = (e) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: null }));
    }
  };

  const handleToggleScreen = (screenId) => {
    const numericId = Number(screenId);
    setSelectedScreenIds((prev) =>
      prev.includes(numericId) ? prev.filter((id) => id !== numericId) : [...prev, numericId]
    );
    if (formErrors.screens) {
      setFormErrors((prev) => ({ ...prev, screens: null }));
    }
  };

  const handleSelectAll = () => {
    setSelectedScreenIds(screens.map((s) => Number(s.id)));
    if (formErrors.screens) {
      setFormErrors((prev) => ({ ...prev, screens: null }));
    }
  };

  const handleDeselectAll = () => {
    setSelectedScreenIds([]);
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Role Name is required';
    }
    if (!slug.trim()) {
      errors.slug = 'Role Slug is required';
    } else if (!/^[a-z0-9_]+$/.test(slug.trim())) {
      errors.slug = 'Role Slug should only contain lowercase letters, numbers, and underscores';
    }
    if (selectedScreenIds.length === 0) {
      errors.screens = 'Please select at least one screen for this role';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        screen_ids: selectedScreenIds,
      };

      const created = await createRole(payload);
      setSubmitSuccess(`Role "${created.name || name}" created successfully with ${selectedScreenIds.length} accessible screen(s)!`);

      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setSelectedScreenIds([]);
      setSlugManuallyEdited(false);
      setFormErrors({});

      // Refresh roles list from backend
      const refreshedRoles = await getRoles();
      setRoles(refreshedRoles || []);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create role. Please check backend response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract screens assigned to a role
  const getRoleScreens = (roleItem) => {
    const screenMap = new Map();
    if (roleItem.permissions && Array.isArray(roleItem.permissions)) {
      roleItem.permissions.forEach((perm) => {
        if (perm.screen) {
          screenMap.set(perm.screen.id, perm.screen);
        }
      });
    }
    return Array.from(screenMap.values());
  };

  return (
    <Box>
      {/* Header */}
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
            <RolesIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Admin Role Management
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Create roles and configure screen access permissions via RBAC (GET /api/screens, POST /api/roles)
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Global Load Error */}
      {loadError && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}>
          {loadError}
        </Alert>
      )}

      {isLoadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3.5, alignItems: 'start' }}>
          {/* Create Role Form */}
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
                Create Role
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                Define a role and select the operational screens this role is allowed to see.
              </Typography>

              {/* Success Alert */}
              {submitSuccess && (
                <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSubmitSuccess('')}>
                  {submitSuccess}
                </Alert>
              )}

              {/* Error Alert */}
              {submitError && (
                <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setSubmitError('')}>
                  <AlertTitle>Creation Failed</AlertTitle>
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    id="role-name-input"
                    label="Role Name"
                    placeholder="e.g. Manager"
                    fullWidth
                    required
                    value={name}
                    onChange={handleNameChange}
                    error={Boolean(formErrors.name)}
                    helperText={formErrors.name}
                    disabled={isSubmitting}
                  />

                  <TextField
                    id="role-slug-input"
                    label="Role Slug"
                    placeholder="e.g. manager"
                    fullWidth
                    required
                    value={slug}
                    onChange={handleSlugChange}
                    error={Boolean(formErrors.slug)}
                    helperText={formErrors.slug || 'Unique slug identifier in snake_case'}
                    disabled={isSubmitting}
                  />

                  <TextField
                    id="role-description-input"
                    label="Description"
                    placeholder="e.g. Operational manager overseeing inventory & orders"
                    fullWidth
                    multiline
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                  />

                  {/* Available Screens Selection */}
                  <Box sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Select Screens ({selectedScreenIds.length} selected):
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="text"
                          onClick={handleSelectAll}
                          disabled={isSubmitting}
                          sx={{ fontSize: '0.75rem', textTransform: 'none', py: 0.2 }}
                        >
                          Select All
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="inherit"
                          onClick={handleDeselectAll}
                          disabled={isSubmitting}
                          sx={{ fontSize: '0.75rem', textTransform: 'none', py: 0.2 }}
                        >
                          Clear
                        </Button>
                      </Stack>
                    </Box>

                    {formErrors.screens && (
                      <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1 }}>
                        {formErrors.screens}
                      </Typography>
                    )}

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        borderColor: formErrors.screens ? 'error.main' : '#e2e8f0',
                        backgroundColor: '#f8fafc',
                        maxHeight: 280,
                        overflowY: 'auto',
                      }}
                    >
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5 }}>
                        {screens.map((screen) => {
                          const isChecked = selectedScreenIds.includes(Number(screen.id));
                          return (
                            <Box key={screen.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleToggleScreen(screen.id)}
                                    disabled={isSubmitting}
                                    color="primary"
                                    size="small"
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ color: isChecked ? '#2563eb' : '#64748b', display: 'flex' }}>
                                      {getScreenIcon(screen.slug, { sx: { fontSize: 16 } })}
                                    </Box>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: isChecked ? 700 : 500, fontSize: '0.82rem', color: '#0f172a' }}>
                                        {screen.name}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                                        {screen.route}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                                sx={{ m: 0, p: 0.5, width: '100%' }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  </Box>

                  <Button
                    id="create-role-btn"
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
                        <span>Creating Role...</span>
                      </Stack>
                    ) : (
                      'Create Role'
                    )}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          {/* Existing Roles List */}
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
                  Existing Roles ({roles.length})
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Roles currently configured in the database
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
              <Table size="small" sx={{ minWidth: 500 }}>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0' } }}>
                      <TableCell>Role</TableCell>
                      <TableCell>Slug</TableCell>
                      <TableCell>Assigned Screens</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((r) => {
                      const roleScreens = getRoleScreens(r);
                      return (
                        <TableRow
                          key={r.id}
                          sx={{
                            '&:hover': { backgroundColor: '#f8fafc' },
                            '& td': { borderColor: '#f1f5f9' },
                          }}
                        >
                          <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {r.name}
                            </Typography>
                            {r.description && (
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                {r.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>
                            <Chip
                              label={r.slug}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>
                            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                              {roleScreens.length > 0 ? (
                                roleScreens.map((s) => (
                                  <Chip
                                    key={s.id}
                                    label={s.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: '0.68rem',
                                      height: 20,
                                      borderColor: '#e2e8f0',
                                      color: '#0f172a',
                                    }}
                                  />
                                ))
                              ) : (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  No direct screens
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
        </Box>
      )}
    </Box>
  );
};

export default RoleManagementPage;
