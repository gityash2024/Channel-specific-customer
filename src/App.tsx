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
  LogOut,
  Menu,
  X
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

const LoadingModal = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="glass-card p-8 rounded-xl z-10 flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mb-4 glow-sm" />
        <h2 className="text-xl font-bold text-white">Loading Data...</h2>
        <p className="text-white mt-2 high-contrast-text">Please wait while we fetch your information</p>
      </div>
    </div>
  );
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeLocalStorage();
    setAuthenticated(isAuthenticated());
    
    if (isAuthenticated()) {
      fetchData();
    }
  }, []);

  const fetchData = () => {
    try {
      setLoading(true);
      
      const channelsData = getChannels();
      setChannels(channelsData);
      
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
      
      fetchData();
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
    setTimeout(() => {
      fetchData();
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    fetchData();
  };

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer => 
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-900">
        <div className="glass-card p-8 rounded-xl">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-white mb-4 glow-sm" />
            <h2 className="text-xl font-bold text-white">Loading Data...</h2>
            <p className="text-white mt-2 high-contrast-text">Please wait while we fetch your channels and customers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-900 text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          },
        }}
      />
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="glass-dialog max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white high-contrast-text">
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="btn-outline">
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

      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white glow-sm" />
                <span className="truncate">Channel-Specific Customers</span>
              </h1>
              <button 
                className="md:hidden bg-black/30 p-2 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
            
            <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto`}>
              <div className="flex-grow md:w-64">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-outline flex-1 md:flex-none"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="truncate">Refresh</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="btn-outline flex-1 md:flex-none"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="truncate">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-white glow-sm" />
                Channels
                <span className="badge badge-info">
                  {channels.length}
                </span>
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="btn-outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Channel
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-dialog max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">Add New Channel</DialogTitle>
                    <DialogDescription className="text-white high-contrast-text">
                      Create a new channel and set its global login access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Channel Name</label>
                      <Input
                        value={newChannel.name}
                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                        placeholder="Enter channel name"
                        className="search-input"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allow_global_login"
                        checked={newChannel.allow_global_login}
                        onChange={(e) => setNewChannel({ ...newChannel, allow_global_login: e.target.checked })}
                        className="rounded border-white bg-black/50 text-indigo-500"
                      />
                      <label htmlFor="allow_global_login" className="text-sm font-medium text-white">
                        Allow Global Login
                      </label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddChannel}
                      className="btn-primary w-full md:w-auto"
                    >
                      Add Channel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {filteredChannels.length === 0 ? (
                <div className="text-center py-10 md:py-12 border-2 border-dashed border-white/20 rounded-lg bg-black/20">
                  <Info className="w-10 h-10 mx-auto text-white mb-2 glow-sm" />
                  <p className="text-white high-contrast-text px-2">No channels found. Add your first channel to get started.</p>
                </div>
              ) : (
                filteredChannels.map(channel => (
                  <div key={channel.id} className="border-2 border-white/20 rounded-lg p-4 hover:border-white/40 transition-colors bg-black/20 backdrop-blur-sm hover:bg-black/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white flex items-center gap-2">
                          <span className="truncate">{channel.name}</span>
                          {channel.allow_global_login ? (
                            <ShieldCheck className="w-4 h-4 text-green-400 glow-sm flex-shrink-0" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-orange-400 glow-sm flex-shrink-0" />
                          )}
                        </h3>
                        <p className="text-xs text-white mt-1 font-mono truncate">
                          ID: {channel.id}
                        </p>
                        <div className="mt-2 flex items-center flex-wrap">
                          <span className="text-xs text-white">Global Login:</span>
                          <span className={`ml-2 badge ${
                            channel.allow_global_login 
                              ? 'badge-success' 
                              : 'badge-warning'
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
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5 text-white glow-sm" />
                Customers
                <span className="badge badge-info">
                  {customers.length}
                </span>
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="btn-outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-dialog max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white">Add New Customer</DialogTitle>
                    <DialogDescription className="text-white high-contrast-text">
                      Create a new customer and assign their channel access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Email</label>
                      <Input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        placeholder="Enter email"
                        className="search-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">First Name</label>
                      <Input
                        value={newCustomer.first_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                        placeholder="Enter first name"
                        className="search-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Last Name</label>
                      <Input
                        value={newCustomer.last_name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                        placeholder="Enter last name"
                        className="search-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Channel Access</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {channels.length === 0 ? (
                          <p className="text-orange-300 text-xs">No channels available. Please create channels first.</p>
                        ) : (
                          channels.map(channel => (
                            <div key={channel.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-black/30">
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
                                className="rounded border-white bg-black/50 text-indigo-500"
                              />
                              <label htmlFor={`channel_${channel.id}`} className="text-sm text-white flex items-center justify-between w-full">
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
                      <p className="text-xs text-white mt-2 high-contrast-text">
                        <Info className="w-3 h-3 inline mr-1" />
                        Leave empty for global access (only to channels that allow global login).
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddCustomer}
                      className="btn-primary w-full md:w-auto"
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
                <div className="text-center py-10 md:py-12 border-2 border-dashed border-white/20 rounded-lg bg-black/20">
                  <Info className="w-10 h-10 mx-auto text-white mb-2 glow-sm" />
                  <p className="text-white high-contrast-text px-2">No customers found. Add your first customer to get started.</p>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className="border-2 border-white/20 rounded-lg p-4 hover:border-white/40 transition-colors bg-black/20 backdrop-blur-sm hover:bg-black/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <p className="text-xs text-white mt-1 truncate">{customer.email}</p>
                        <p className="text-xs text-white mt-1 font-mono truncate">ID: {customer.id}</p>
                        <div className="mt-2">
                          <span className="text-xs text-white">Access Type:</span>
                          <span className="ml-2 badge badge-info">
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
                            <span className="text-xs text-white">Channel Access:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {customer.channel_ids.map(channelId => {
                                const channel = channels.find(c => c.id === channelId);
                                return (
                                  <span key={channelId} className="badge badge-purple">
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
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
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
      
      <footer className="fixed bottom-0 left-0 right-0 glass-footer py-3 z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white text-sm high-contrast-text">Channel-Specific Customers Management · {new Date().getFullYear()}</p>
        </div>
      </footer>
      
      <LoadingModal visible={refreshing} />
    </div>
  );
}

export default App;