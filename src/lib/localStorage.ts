export const localStorageKeys = {
  CHANNELS: 'channels',
  CUSTOMERS: 'customers',
  CUSTOMER_CHANNELS: 'customer_channels',
  USER: 'user'
};

export interface Channel {
  id: string;
  name: string;
  allow_global_login: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface CustomerChannel {
  id: string;
  customer_id: string;
  channel_id: string;
  created_at: string;
}

export interface User {
  email: string;
  password: string;
  isLoggedIn: boolean;
}

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const initializeLocalStorage = (): void => {
  // Initialize channels
  if (!localStorage.getItem(localStorageKeys.CHANNELS)) {
    const initialChannels: Channel[] = [
      {
        id: generateUUID(),
        name: 'Default Channel',
        allow_global_login: true,
        created_at: new Date().toISOString()
      },
      {
        id: generateUUID(),
        name: 'Premium Channel',
        allow_global_login: false,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(localStorageKeys.CHANNELS, JSON.stringify(initialChannels));
  }
  
  // Initialize customers
  if (!localStorage.getItem(localStorageKeys.CUSTOMERS)) {
    localStorage.setItem(localStorageKeys.CUSTOMERS, JSON.stringify([]));
  }
  
  // Initialize customer_channels
  if (!localStorage.getItem(localStorageKeys.CUSTOMER_CHANNELS)) {
    localStorage.setItem(localStorageKeys.CUSTOMER_CHANNELS, JSON.stringify([]));
  }
  
  // Initialize user with admin@example.com (not mirsat)
  if (!localStorage.getItem(localStorageKeys.USER)) {
    const mockUser: User = {
      email: 'admin@example.com',
      password: 'password123',
      isLoggedIn: false
    };
    localStorage.setItem(localStorageKeys.USER, JSON.stringify(mockUser));
  } else {
    // Update existing user if it has mirsat email to ensure credentials match
    const existingUser = getUser();
    if (existingUser && existingUser.email.includes('mirsat')) {
      existingUser.email = 'admin@example.com';
      existingUser.password = 'password123';
      localStorage.setItem(localStorageKeys.USER, JSON.stringify(existingUser));
    }
  }
};

// Channel operations
export const getChannels = (): Channel[] => {
  const channelsStr = localStorage.getItem(localStorageKeys.CHANNELS);
  return channelsStr ? JSON.parse(channelsStr) : [];
};

export const addChannel = (channelData: Omit<Channel, 'id' | 'created_at'>): Channel => {
  const newChannel: Channel = {
    ...channelData,
    id: generateUUID(),
    created_at: new Date().toISOString()
  };
  
  const channels = getChannels();
  channels.push(newChannel);
  localStorage.setItem(localStorageKeys.CHANNELS, JSON.stringify(channels));
  return newChannel;
};

export const deleteChannel = (channelId: string): boolean => {
  const channels = getChannels();
  const filteredChannels = channels.filter(c => c.id !== channelId);
  
  if (filteredChannels.length < channels.length) {
    localStorage.setItem(localStorageKeys.CHANNELS, JSON.stringify(filteredChannels));
    
    // Also delete any customer-channel relationships
    const customerChannels = getCustomerChannels();
    const filteredCustomerChannels = customerChannels.filter(cc => cc.channel_id !== channelId);
    localStorage.setItem(localStorageKeys.CUSTOMER_CHANNELS, JSON.stringify(filteredCustomerChannels));
    
    return true;
  }
  return false;
};

// Customer operations
export const getCustomers = (): Customer[] => {
  const customersStr = localStorage.getItem(localStorageKeys.CUSTOMERS);
  return customersStr ? JSON.parse(customersStr) : [];
};

export const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at'>, channelIds: string[] = []): Customer => {
  const newCustomer: Customer = {
    ...customerData,
    id: generateUUID(),
    created_at: new Date().toISOString()
  };
  
  const customers = getCustomers();
  customers.push(newCustomer);
  localStorage.setItem(localStorageKeys.CUSTOMERS, JSON.stringify(customers));
  
  // Create customer-channel relationships if specified
  if (channelIds.length > 0) {
    const customerChannels = getCustomerChannels();
    
    channelIds.forEach(channelId => {
      const newCustomerChannel: CustomerChannel = {
        id: generateUUID(),
        customer_id: newCustomer.id,
        channel_id: channelId,
        created_at: new Date().toISOString()
      };
      customerChannels.push(newCustomerChannel);
    });
    
    localStorage.setItem(localStorageKeys.CUSTOMER_CHANNELS, JSON.stringify(customerChannels));
  }
  
  return newCustomer;
};

export const deleteCustomer = (customerId: string): boolean => {
  const customers = getCustomers();
  const filteredCustomers = customers.filter(c => c.id !== customerId);
  
  if (filteredCustomers.length < customers.length) {
    localStorage.setItem(localStorageKeys.CUSTOMERS, JSON.stringify(filteredCustomers));
    
    // Also delete any customer-channel relationships
    const customerChannels = getCustomerChannels();
    const filteredCustomerChannels = customerChannels.filter(cc => cc.customer_id !== customerId);
    localStorage.setItem(localStorageKeys.CUSTOMER_CHANNELS, JSON.stringify(filteredCustomerChannels));
    
    return true;
  }
  return false;
};

// Customer-Channel operations
export const getCustomerChannels = (): CustomerChannel[] => {
  const customerChannelsStr = localStorage.getItem(localStorageKeys.CUSTOMER_CHANNELS);
  return customerChannelsStr ? JSON.parse(customerChannelsStr) : [];
};

export const getCustomerWithChannels = (): Array<Customer & { channel_ids?: string[] | null }> => {
  const customers = getCustomers();
  const customerChannels = getCustomerChannels();
  
  return customers.map(customer => {
    const channelRelationships = customerChannels.filter(cc => cc.customer_id === customer.id);
    const channel_ids = channelRelationships.map(cr => cr.channel_id);
    
    return {
      ...customer,
      channel_ids: channel_ids.length > 0 ? channel_ids : null
    };
  });
};

// User operations
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(localStorageKeys.USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const login = (email: string, password: string): boolean => {
  const user = getUser();
  
  // If user doesn't exist, try to initialize
  if (!user) {
    initializeLocalStorage();
    const newUser = getUser();
    if (newUser && newUser.email === email && newUser.password === password) {
      newUser.isLoggedIn = true;
      localStorage.setItem(localStorageKeys.USER, JSON.stringify(newUser));
      return true;
    }
    return false;
  }
  
  // Check if credentials match user or admin@example.com fallback
  if ((user.email === email && user.password === password) || 
      (email === 'admin@example.com' && password === 'password123')) {
    user.isLoggedIn = true;
    localStorage.setItem(localStorageKeys.USER, JSON.stringify(user));
    return true;
  }
  
  return false;
};

export const logout = (): void => {
  const user = getUser();
  
  if (user) {
    user.isLoggedIn = false;
    localStorage.setItem(localStorageKeys.USER, JSON.stringify(user));
  }
};

export const isAuthenticated = (): boolean => {
  const user = getUser();
  return user ? user.isLoggedIn : false;
};