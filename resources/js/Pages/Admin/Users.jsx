import { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import {
  Search, Filter, UserPlus, RotateCcw, Edit2, User, ClipboardList,
  CheckCircle2, Save, Users, Lock, KeyRound, UserCheck, UserCog,
  Mail, Info, Send, AlertTriangle, Power, Loader2, Trash2, ShieldAlert
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// --- Constants ---
const ROLE_COLORS = {
  admin: 'destructive',      // Merah untuk Admin
  koordinator: 'default',    // Hitam/Gelap untuk Koordinator
  surveyor: 'secondary',     // Abu-abu untuk Surveyor
};

// --- Main Component ---
// Menerima 'roles' dari Controller untuk data dinamis
export default function AdminUsers({ users: initialUsers, roles }) {
  const { toast } = useToast();
  const { flash, auth } = usePage().props;

  // State
  const users = initialUsers;
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog States
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState({ open: false, user: null });
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, user: null });
  const [toggleStatusDialog, setToggleStatusDialog] = useState({ open: false, user: null }); // Ganti Deactivate jadi Toggle
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  // Loading States
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms
  const createForm = useForm({ name: '', email: '', role_id: '', password: '', password_confirmation: '' });
  const editForm = useForm({ name: '', email: '', role_id: '', password: '', password_confirmation: '' });

  // --- Derived State & Logic (Updated for New DB Structure) ---

  // Update stats logic: use role_code instead of role
  const userStats = {
    surveyors: users.filter(u => u.role_code === 'surveyor').length,
    koordinators: users.filter(u => u.role_code === 'koordinator').length,
  };

  const managedUsers = users.filter(
    (u) => u.role_code === 'surveyor' || u.role_code === 'koordinator' || u.role_code === 'admin'
  );

  const filteredUsers = managedUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Update: user.role_code
    const matchesRole = roleFilter === 'all' || user.role_code === roleFilter;

    // Update: user.is_active
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // --- Effects ---
  useEffect(() => {
    if (flash?.success) toast({ title: 'Success', description: flash.success });
    if (flash?.error) toast({ title: 'Error', description: flash.error, variant: 'destructive' });
  }, [flash, toast]);

  // --- Handlers ---
  const handleCreateUser = (e) => {
    e.preventDefault();
    createForm.post(route('admin.users.store'), {
      preserveScroll: true,
      onSuccess: () => {
        createForm.reset();
        setCreateUserOpen(false);
      },
    });
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    if (!editUserDialog.user) return;
    editForm.put(route('admin.users.update', editUserDialog.user.id), {
      preserveScroll: true,
      onSuccess: () => {
        setEditUserDialog({ open: false, user: null });
        editForm.reset();
      },
    });
  };

  const openEditDialog = (user) => {
    editForm.setData({
      name: user.name,
      email: user.email,
      role_id: String(user.role_id), // Pastikan string untuk selection
      password: '',
      password_confirmation: ''
    });
    setEditUserDialog({ open: true, user });
  };

  const handleResetPassword = () => {
    if (!resetPasswordDialog.user || isSendingReset) return;
    setIsSendingReset(true);
    router.post(route('admin.users.reset-password', resetPasswordDialog.user.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: 'Password Reset Sent', description: `Reset link sent to ${resetPasswordDialog.user.email}` });
        setResetPasswordDialog({ open: false, user: null });
      },
      onError: (errors) => {
        toast({ title: 'Error', description: errors.message || 'Failed to send reset password email.', variant: 'destructive' });
      },
      onFinish: () => setIsSendingReset(false),
    });
  };

  // Update: Menggunakan endpoint toggle-status
  const handleToggleStatus = () => {
    if (!toggleStatusDialog.user) return;
    router.put(route('admin.users.toggle', toggleStatusDialog.user.id), {}, {
      preserveScroll: true,
      onStart: () => setIsTogglingStatus(true),
      onFinish: () => setIsTogglingStatus(false),
      onSuccess: () => {
        setToggleStatusDialog({ open: false, user: null });
      },
      onError: () => toast({ title: 'Error', description: 'Failed to update user status.', variant: 'destructive' }),
    });
  };

  const handleDelete = () => {
    if (!deleteDialog.user) return;
    router.delete(route('admin.users.destroy', deleteDialog.user.id), {
      preserveScroll: true,
      onStart: () => setIsDeleting(true),
      onFinish: () => setIsDeleting(false),
      onSuccess: () => {
        toast({ title: 'User Deleted', description: 'User has been successfully deleted.' });
        setDeleteDialog({ open: false, user: null });
      },
      // Error ditangani oleh flash message dari controller (Exception)
    });
  };

  return (
    <>
      <Head title="Users Management" />
      {/* Menggunakan auth.user dari props global */}
      <DashboardLayout userName={auth.user.name} userRole={auth.user.role?.code || 'admin'}>
        <div className="space-y-6">

          {/* Header & Create Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
              <p className="text-muted-foreground mt-1">Manage koordinator and surveyor accounts</p>
            </div>
            <CreateUserDialog
              open={createUserOpen}
              onOpenChange={setCreateUserOpen}
              form={createForm}
              onSubmit={handleCreateUser}
            />
          </div>

          {/* Stats */}
          <UserStatsGrid userStats={userStats} managedUsers={managedUsers} />

          {/* Filters */}
          <UserFilterBar
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            roleFilter={roleFilter} setRoleFilter={setRoleFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          />

          {/* Results Summary & Table */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {managedUsers.length} users
          </p>

          <UsersTable
            users={filteredUsers}
            currentUserId={auth.user.id}
            onEdit={openEditDialog}
            onReset={setResetPasswordDialog}
            onToggleStatus={setToggleStatusDialog}
            onDelete={setDeleteDialog}
          />
        </div>

        {/* --- Dialogs --- */}
        <EditUserDialog
          open={editUserDialog.open}
          onOpenChange={(open) => !open && setEditUserDialog({ open: false, user: null })}
          form={editForm}
          onSubmit={handleEditUser}
        />

        <ResetPasswordDialog
          dialog={resetPasswordDialog}
          setDialog={setResetPasswordDialog}
          isLoading={isSendingReset}
          onConfirm={handleResetPassword}
        />

        <StatusConfirmDialog
          dialog={toggleStatusDialog}
          setDialog={setToggleStatusDialog}
          isLoading={isTogglingStatus}
          onConfirm={handleToggleStatus}
        />

        <DeleteConfirmDialog
          dialog={deleteDialog}
          setDialog={setDeleteDialog}
          isLoading={isDeleting}
          onConfirm={handleDelete}
        />

      </DashboardLayout>
    </>
  );
}

// ==========================================
// Sub-Components
// ==========================================

function UserStatsGrid({ userStats, managedUsers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Users"
        value={managedUsers.length}
        icon={Users}
        description="Active System Users"
        variant="primary"
      />
      <StatCard
        title="Surveyors"
        value={userStats.surveyors}
        icon={UserCheck}
        // Update: u.is_active
        description={`${managedUsers.filter(u => u.role_code === 'surveyor' && u.is_active).length} active`}
        variant="success"
      />
      <StatCard
        title="Koordinators"
        value={userStats.koordinators}
        icon={UserCog}
        // Update: u.is_active
        description={`${managedUsers.filter(u => u.role_code === 'koordinator' && u.is_active).length} active`}
        variant="warning"
      />
    </div>
  );
}

function UserFilterBar({ searchTerm, setSearchTerm, roleFilter, setRoleFilter, statusFilter, setStatusFilter }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="surveyor">Surveyor</SelectItem>
            <SelectItem value="koordinator">Koordinator</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function UsersTable({ users, currentUserId, onEdit, onReset, onToggleStatus, onDelete }) {
  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  {/* Update: user.role_code & user.role_label */}
                  <Badge variant={ROLE_COLORS[user.role_code] ?? 'default'} className="capitalize">
                    {user.role_label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {/* Update: user.is_active */}
                  <Badge
                    variant={user.is_active ? 'success' : 'secondary'}
                    className={user.is_active ? 'hover:bg-primary hover:text-primary-foreground focus:ring-primary' : ''}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                {/* Update: user.created_at */}
                <TableCell className="text-muted-foreground text-sm">{user.created_at}</TableCell>
                <TableCell className="text-right">
                  <UserRowActions
                    user={user}
                    isSelf={user.id === currentUserId}
                    onEdit={onEdit}
                    onReset={onReset}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function UserRowActions({ user, isSelf, onEdit, onReset, onToggleStatus, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-slate-100"
        onClick={() => onEdit(user)}
      >
        <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        onClick={() => onReset({ open: true, user })}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
      </Button>

      {/* Hide Toggle & Delete for Self */}
      {!isSelf && (
        <>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 px-2 border transition-colors ${
              user.is_active
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
            }`}
            onClick={() => onToggleStatus({ open: true, user })}
          >
            {user.is_active ? (
              <><Power className="h-3.5 w-3.5 mr-1.5" /> Deactivate</>
            ) : (
              <><Power className="h-3.5 w-3.5 mr-1.5" /> Activate</>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8 px-2 shadow-sm bg-red-600 hover:bg-red-700"
            onClick={() => onDelete({ open: true, user })}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
          </Button>
        </>
      )}
    </div>
  );
}

function CreateUserDialog({ open, onOpenChange, form, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => form.reset()} className="shadow-sm hover:shadow-md transition-all bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" /> Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={onSubmit}>
          {/* Header */}
          <div className="px-6 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-blue-200 dark:shadow-none shadow-md">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create New User</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Onboard a new Surveyor or Koordinator to the platform.</DialogDescription>
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="px-6 py-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" /> Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase">Full Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Budi Santoso" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={`pl-3 h-10 ${form.errors.name ? 'border-destructive ring-destructive/20' : ''}`} />
                  {form.errors.name && <p className="text-xs text-destructive mt-1">{form.errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase">Email Address <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none"><Mail className="h-4 w-4" /></div>
                    <Input type="email" placeholder="user@company.com" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={`pl-9 h-10 ${form.errors.email ? 'border-destructive ring-destructive/20' : ''}`} />
                  </div>
                  {form.errors.email && <p className="text-xs text-destructive mt-1">{form.errors.email}</p>}
                </div>
              </div>
            </div>
            {/* Role Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-500" /> Role Assignment <span className="text-destructive text-xs">*</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID 3 = Surveyor (Sesuai Seeder Baru) */}
                <RoleSelectionCard
                  roleId="3"
                  currentRole={form.data.role_id}
                  setRole={(val) => form.setData('role_id', val)}
                  label="Surveyor"
                  desc="Field data collection only."
                  icon={ClipboardList} color="blue"
                />
                {/* ID 2 = Koordinator (Sesuai Seeder Baru) */}
                <RoleSelectionCard
                  roleId="2"
                  currentRole={form.data.role_id}
                  setRole={(val) => form.setData('role_id', val)}
                  label="Koordinator"
                  desc="Team management & reports."
                  icon={Users} color="indigo"
                />
              </div>
              {form.errors.role_id && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-destructive inline-block"></span>{form.errors.role_id}</p>
              )}
            </div>
            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" /> Security Credentials
              </h3>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase">Initial Password <span className="text-destructive">*</span></Label>
                <div className="relative group">
                  <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors pointer-events-none"><KeyRound className="h-4 w-4" /></div>
                  <Input type="password" placeholder="Min. 8 characters" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className={`pl-9 h-10 ${form.errors.password ? 'border-destructive ring-destructive/20' : 'focus-visible:ring-emerald-500 focus-visible:border-emerald-500'}`} />
                </div>
                {/* Added Confirm Password Field for Safety */}
                 <div className="mt-2 relative group">
                  <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors pointer-events-none"><KeyRound className="h-4 w-4" /></div>
                  <Input type="password" placeholder="Confirm Password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} className="pl-9 h-10" />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mt-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">The user will be required to change this password immediately upon their first successful login.</p>
                </div>
                {form.errors.password && <p className="text-xs text-destructive mt-1">{form.errors.password}</p>}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={form.processing}>Cancel</Button>
            <Button type="submit" disabled={form.processing} className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {form.processing ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Creating...</> : <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ open, onOpenChange, form, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-xl">
        <form onSubmit={onSubmit}>
          <div className="px-6 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <UserCog className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold tracking-tight">Edit User Profile</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Make changes to the user's account details and access level.</DialogDescription>
              </div>
            </div>
          </div>
          <div className="px-6 py-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 pb-2 border-b">
                <User className="h-4 w-4" /> Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Full Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="John Doe" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={`h-10 ${form.errors.name ? 'border-destructive ring-destructive/20' : ''}`} />
                  {form.errors.name && <p className="text-xs text-destructive mt-1">{form.errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Email Address <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-muted-foreground"><Mail className="h-4 w-4" /></div>
                    <Input type="email" placeholder="user@company.com" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={`h-10 pl-9 ${form.errors.email ? 'border-destructive ring-destructive/20' : ''}`} />
                  </div>
                  {form.errors.email && <p className="text-xs text-destructive mt-1">{form.errors.email}</p>}
                </div>
              </div>
            </div>
            <div className="space-y-3 col-span-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
                Assigned Role <span className="text-destructive">*</span>
                <span className="text-[10px] font-normal normal-case text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {/* ID Sesuai Seeder Baru */}
                  {form.data.role_id === '3' ? 'Surveyor Selected' : form.data.role_id === '2' ? 'Koordinator Selected' : 'No role selected'}
                </span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoleSelectionCard
                  roleId="3" currentRole={form.data.role_id} setRole={(val) => form.setData('role_id', val)}
                  label="Surveyor" desc="Responsible for field data collection." icon={ClipboardList} color="blue"
                />
                <RoleSelectionCard
                  roleId="2" currentRole={form.data.role_id} setRole={(val) => form.setData('role_id', val)}
                  label="Koordinator" desc="Manages surveyor teams." icon={Users} color="indigo"
                />
              </div>
              {form.errors.role_id && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-destructive"></span>{form.errors.role_id}</p>}
            </div>

            {/* Optional Password Change during Edit */}
             <div className="pt-2 border-t mt-4">
               <Label className="text-muted-foreground mb-2 block">Change Password (Optional)</Label>
               <div className="grid grid-cols-2 gap-4">
                  <Input type="password" placeholder="New Password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} />
                  <Input type="password" placeholder="Confirm" value={form.data.password_confirmation} onChange={e => form.setData('password_confirmation', e.target.value)} />
               </div>
               {form.errors.password && <p className="text-xs text-red-500 mt-1">{form.errors.password}</p>}
             </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={form.processing}>Cancel</Button>
            <Button type="submit" disabled={form.processing} className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white">
              {form.processing ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Updating...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleSelectionCard({ roleId, currentRole, setRole, label, desc, icon: Icon, color }) {
  const isSelected = currentRole === roleId;

  const styleConfig = {
    blue: {
        cardBorder: 'border-blue-600',
        cardBg: 'bg-blue-50/40 dark:bg-blue-900/2',
        iconSelected: 'bg-blue-600 border-blue-600 text-white',
        title: 'text-blue-700 dark:text-blue-400',
        checkText: 'text-blue-600',
        checkFill: 'fill-blue-100',
    },
    indigo: {
        cardBorder: 'border-indigo-600',
        cardBg: 'bg-indigo-50/40 dark:bg-indigo-900/2',
        iconSelected: 'bg-indigo-600 border-indigo-600 text-white',
        title: 'text-indigo-700 dark:text-indigo-400',
        checkText: 'text-indigo-600',
        checkFill: 'fill-indigo-100',
    }
  };

  const activeStyle = styleConfig[color] || styleConfig.blue;

  const cardClasses = `relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md group ${
    isSelected
    ? `activeStyle.cardBorder + ' ' + activeStyle.cardBg`
    : 'border-muted hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800'
  }`;

  const iconClasses = `mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
    isSelected
    ? activeStyle.iconSelected
    : 'bg-white border-slate-200 text-slate-500'
  }`;

  const titleClasses = `font-semibold text-sm ${isSelected ? activeStyle.title : 'text-foreground'}`;

  return (
    <div onClick={() => setRole(roleId)} className={cardClasses}>
      <div className="flex items-start gap-3">
        <div className={iconClasses}><Icon className="h-5 w-5" /></div>
        <div className="space-y-1">
          <p className={titleClasses}>{label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
      {isSelected && (
        <div className={`absolute top-3 right-3 ${activeStyle.checkText} animate-in fade-in zoom-in duration-300`}>
          <CheckCircle2 className={`h-5 w-5 ${activeStyle.checkFill}`} />
        </div>
      )}
    </div>
  );
}

function ResetPasswordDialog({ dialog, setDialog, isLoading, onConfirm }) {
  return (
    <Dialog open={dialog.open} onOpenChange={(open) => !isLoading && setDialog({ open, user: dialog.user })}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full blur-lg opacity-20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
              <RotateCcw className="h-7 w-7 text-blue-600" strokeWidth={2} />
            </div>
          </div>
          <div className="space-y-3">
            <DialogTitle className="text-xl font-semibold tracking-tight">Reset User Password</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm">A secure password reset link will be sent to the user's registered email address.</DialogDescription>
          </div>
          <div className="w-full">
            <div className="group relative rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-border"><Mail className="h-5 w-5 text-muted-foreground" /></div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Email Address</p>
                  <p className="text-sm font-medium text-foreground truncate">{dialog.user?.email || 'No email available'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <p className="text-xs font-medium text-blue-900">Important Information</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Reset link expires in 60 minutes</li>
                  <li>• User must complete the process to change password</li>
                  <li>• Current password remains active until reset is completed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row justify-end gap-2 sm:gap-3 pt-6 border-t">
          <Button variant="outline" disabled={isLoading} onClick={() => setDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={onConfirm} disabled={isLoading || !dialog.user?.email} className="min-w-[160px]">
            {isLoading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Sending…</> : <><Send className="h-4 w-4 mr-2" /> Send Reset Link</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusConfirmDialog({ dialog, setDialog, isLoading, onConfirm }) {
  // Update: Menggunakan is_active
  const isActive = dialog.user?.is_active;

  return (
    <ConfirmDialog
      open={dialog.open}
      onOpenChange={(open) => !isLoading && setDialog({ open, user: dialog.user })}
      title={
        <div className="flex items-center gap-3 pb-1">
          {isActive ? (
            <div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
          ) : (
            <div className="p-2 bg-blue-100 rounded-full"><Power className="h-5 w-5 text-blue-600" /></div>
          )}
          <span className={isActive ? "text-red-700" : "text-blue-700"}>{isActive ? 'Deactivate Access' : 'Restore Access'}</span>
        </div>
      }
      description={
        <div className="flex flex-col gap-3 pt-2 text-sm text-muted-foreground">
          <p>Are you sure you want to change the status for user <span className="font-semibold text-foreground text-base">{dialog.user?.name}</span>?</p>
          <div className={`p-3 rounded-md border text-xs flex gap-2 items-start ${isActive ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
            <span className="mt-0.5 font-bold">Note:</span>
            <span>{isActive ? "User will immediately lose access to the dashboard." : "User will regain full access to the system immediately."}</span>
          </div>
        </div>
      }
      confirmLabel={isLoading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Processing...</span></div> : (isActive ? 'Yes, Deactivate' : 'Yes, Activate')}
      disabled={isLoading}
      onConfirm={(e) => {
        if (e?.preventDefault) e.preventDefault();
        onConfirm();
      }}
      cancelLabel="Cancel"
    />
  );
}

function DeleteConfirmDialog({ dialog, setDialog, isLoading, onConfirm }) {
  return (
    <ConfirmDialog
      open={dialog.open}
      onOpenChange={(open) => !isLoading && setDialog({ open, user: dialog.user })}
      title={
        <div className="flex items-center gap-3 pb-1">
          <div className="p-2 bg-red-100 rounded-full"><ShieldAlert className="h-5 w-5 text-red-600"/></div>
          <span className="text-red-700">Delete User Account</span>
        </div>
      }
      description={
        <div className="flex flex-col gap-3 pt-2 text-sm text-muted-foreground">
          <p>Are you sure you want to delete user <span className="font-semibold text-foreground text-base">{dialog.user?.name}</span>?</p>
          {/* Update: Penjelasan tentang Logical Guard */}
          <div className="p-3 rounded-md border border-red-100 bg-red-50 text-xs flex gap-2 items-start text-red-800">
            <span className="mt-0.5 font-bold">WARNING:</span>
            <span>
              This is a <strong>Permanent Delete</strong>.
              <ul className="list-disc pl-4 mt-1">
                <li>If the user has <strong>Parcel Data</strong>, the system will BLOCK this action to preserve history.</li>
                <li>If the user is empty, they will be removed forever.</li>
              </ul>
            </span>
          </div>
        </div>
      }
      confirmLabel={isLoading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Deleting...</span></div> : 'Yes, Delete Permanently'}
      cancelLabel="Cancel"
      variant="destructive"
      disabled={isLoading}
      onConfirm={(e) => {
        if (e?.preventDefault) e.preventDefault();
        onConfirm();
      }}
    />
  );
}
