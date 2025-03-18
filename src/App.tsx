import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Loader2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Link,
  LogOut
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './components/ui/dialog';
import toast, { Toaster } from 'react-hot-toast';
import Login from './Login';
import { 
  Channel, 
  Customer, 
  initializeLocalStorage,
  getChannels,
  getCustomerWithChannels,
  addChannel,
  addCustomer,
  deleteChannel,
  deleteCustomer,
  isAuthenticated,
  logout
} from './lib/localStorage';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [customers, setCustomers] = useState<Array<Customer & { channel_ids?: string[] | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', allow_global_login: false });
  const [newCustomer, setNewCustomer] = useState({
    email: '',
    first_name: '',
    last_name: '',
    channel_ids: [] as string[],
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'channel' | 'customer', id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize localStorage with sample data if not already initialized
    initializeLocalStorage();
    
    // Check if user is authenticated
    setAuthenticated(isAuthenticated());
    
    // Load data if authenticated
    if (isAuthenticated()) {
      fetchData();
    }
  }, []);

  const fetchData = () => {
    try {
      setLoading(true);
      
      // Get channels from localStorage
      const channelsData = getChannels();
      setChannels(channelsData);
      
      // Get customers with their channel associations
      const customersData = getCustomerWithChannels();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddChannel = () => {
    try {
      if (!newChannel.name.trim()) {
        toast.error('Channel name is required');
        return;
      }
      
      const createdChannel = addChannel({
        name: newChannel.name,
        allow_global_login: newChannel.allow_global_login
      });
      
      setChannels([...channels, createdChannel]);
      toast.success('Channel added successfully');
      setNewChannel({ name: '', allow_global_login: false });
    } catch (error) {
      console.error('Error adding channel:', error);
      toast.error('Failed to add channel');
    }
  };

  const handleAddCustomer = () => {
    try {
      if (!newCustomer.email.trim() || !newCustomer.first_name.trim() || !newCustomer.last_name.trim()) {
        toast.error('Email, first name, and last name are required');
        return;
      }
      
      addCustomer({
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name
      }, newCustomer.channel_ids);
      
      fetchData(); // Refresh to get the updated list
      toast.success('Customer added successfully');
      setNewCustomer({
        email: '',
        first_name: '',
        last_name: '',
        channel_ids: []
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    try {
      let success = false;
      
      if (itemToDelete.type === 'customer') {
        success = deleteCustomer(itemToDelete.id);
        if (success) {
          setCustomers(customers.filter(c => c.id !== itemToDelete.id));
          toast.success('Customer deleted successfully');
        }
      } else {
        success = deleteChannel(itemToDelete.id);
        if (success) {
          setChannels(channels.filter(c => c.id !== itemToDelete.id));
          toast.success('Channel deleted successfully');
        }
      }
      
      if (!success) {
        toast.error(`Failed to delete ${itemToDelete.type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const initiateDelete = (type: 'channel' | 'customer', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    fetchData();
  };

  // If not authenticated, show login screen
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-300 mb-4" />
            <h2 className="text-xl font-bold text-white">Loading Data...</h2>
            <p className="text-indigo-200 mt-2">Please wait while we fetch your channels and customers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            color: '#334155',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          },
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800/90 border-indigo-500/20 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-indigo-200">
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="border-indigo-400 text-indigo-200 hover:bg-indigo-800/50">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="bg-red-500/70 hover:bg-red-600/90 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-indigo-300" />
              Channel-Specific Customers
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-indigo-200 focus-visible:ring-indigo-400 w-64"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Channels Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6 hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-indigo-300" />
                Channels
                <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-1 rounded-full">
                  {channels.length}
                </span>
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Channel
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800/90 border-indigo-500/20 text-white backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">Add New Channel</DialogTitle>
                    <DialogDescription className="text-indigo-200">
                      Create a new channel and set its global login access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-100">Channel Name</label>
                      <Input
                        value={newChannel.name}
                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                        placeholder="Enter channel name"
                        className="bg-slate-700/50 border-indigo-500/30 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allow_global_login"
                        checked={newChannel.allow_global_login}
                        onChange={(e) => setNewChannel({ ...newChannel, allow_global_login: e.target.checked })}
                        className="rounded border-indigo-500 bg-slate-700/50 text-indigo-500 focus:ring-indigo-500"
                      />
                      <label htmlFor="allow_global_login" className="text-sm font-medium text-indigo-100">
                        Allow Global Login
                      </label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddChannel}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Add Channel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {filteredChannels.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-indigo-500/20 rounded-lg bg-indigo-500/5">
                  <Info className="w-10 h-10 mx-auto text-indigo-300 mb-2" />
                  <p className="text-indigo-200">No channels found. Add your first channel to get started.</p>
                </div>
              ) : (
                filteredChannels.map(channel => (
                  <div key={channel.id} className="border border-white/10 rounded-lg p-4 hover:border-indigo-400/30 transition-colors bg-white/5 backdrop-blur-sm hover:bg-indigo-600/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white flex items-center gap-2">
                          {channel.name}
                          {channel.allow_global_login ? (
                            <ShieldCheck className="w-4 h-4 text-green-400" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-orange-400" />
                          )}
                        </h3>
                        <p className="text-xs text-indigo-300 mt-1 font-mono">
                          ID: {channel.id}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-indigo-200">Global Login:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                            channel.allow_global_login 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          }`}>
                            {channel.allow_global_login ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Enabled
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Disabled
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => initiateDelete('channel', channel.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customers Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6 hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5 text-indigo-300" />
                Customers
                <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-1 rounded-full">
                  {customers.length}
                </span>
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800/90 border-indigo-500/20 text-white backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">Add New Customer</DialogTitle>
                    <DialogDescription className="text-indigo-200">
                      Create a new customer and assign their channel access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-100">Email</label>
                      <Input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        placeholder="Enter email"
                        className="bg-slate-700/50 border-indigo-500/30 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-100">First Name</label>
                      <Input
                        value={newCustomer.first_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                        placeholder="Enter first name"
                        className="bg-slate-700/50 border-indigo-500/30 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-100">Last Name</label>
                      <Input
                        value={newCustomer.last_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                        placeholder="Enter last name"
                        className="bg-slate-700/50 border-indigo-500/30 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-100">Channel Access</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {channels.length === 0 ? (
                          <p className="text-orange-300 text-xs">No channels available. Please create channels first.</p>
                        ) : (
                          channels.map(channel => (
                            <div key={channel.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-indigo-600/20">
                              <input
                                type="checkbox"
                                id={`channel_${channel.id}`}
                                checked={newCustomer.channel_ids.includes(channel.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewCustomer({
                                      ...newCustomer,
                                      channel_ids: [...newCustomer.channel_ids, channel.id]
                                    });
                                  } else {
                                    setNewCustomer({
                                      ...newCustomer,
                                      channel_ids: newCustomer.channel_ids.filter(id => id !== channel.id)
                                    });
                                  }
                                }}
                                className="rounded border-indigo-500 bg-slate-700/50 text-indigo-500 focus:ring-indigo-500"
                              />
                              <label htmlFor={`channel_${channel.id}`} className="text-sm text-indigo-100 flex items-center justify-between w-full">
                                <span>{channel.name}</span>
                                {channel.allow_global_login && (
                                  <span className="text-xs text-green-300 flex items-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Global
                                  </span>
                                )}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-indigo-300 mt-1">
                        <Info className="w-3 h-3 inline mr-1" />
                        Leave empty for global access (only to channels that allow global login).
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddCustomer}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={channels.length === 0}
                    >
                      Add Customer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-indigo-500/20 rounded-lg bg-indigo-500/5">
                  <Info className="w-10 h-10 mx-auto text-indigo-300 mb-2" />
                  <p className="text-indigo-200">No customers found. Add your first customer to get started.</p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className="border border-white/10 rounded-lg p-4 hover:border-indigo-400/30 transition-colors bg-white/5 backdrop-blur-sm hover:bg-indigo-600/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <p className="text-xs text-indigo-300 mt-1">{customer.email}</p>
                        <p className="text-xs text-indigo-300 mt-1 font-mono">ID: {customer.id}</p>
                        <div className="mt-2">
                          <span className="text-xs text-indigo-200">Access Type:</span>
                          <span className="ml-2 px-2 py-1 text-xs rounded-full flex items-center gap-1 border border-indigo-500/30 bg-indigo-500/20 text-indigo-200">
                            {!customer.channel_ids?.length ? (
                              <>
                                <Link className="w-3 h-3" /> Global Access
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" /> Channel Specific
                              </>
                            )}
                          </span>
                        </div>
                        {customer.channel_ids?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-indigo-200">Channel Access:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {customer.channel_ids.map(channelId => {
                                const channel = channels.find(c => c.id === channelId);
                                return (
                                  <span key={channelId} className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                                    {channel?.name || `Channel ${channelId.slice(0, 8)}...`}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => initiateDelete('customer', customer.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/30 py-4 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-indigo-300 text-sm">Channel-Specific Customers Management · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;