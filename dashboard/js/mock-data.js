/* ============================================
   TAG ADMIN — Centralized Mock Data
   Replace these with API responses when
   the backend is ready.
   ============================================ */

// ---- ORDERS ----
let MOCK_ORDERS = [
  {
    id: 'TAG-1001',
    customer: 'Marcus Chen',
    email: 'marcus.chen@email.com',
    phone: '+1 212-555-0147',
    date: '2026-08-10',
    items: [
      { productId: 1, name: 'Oversized Logo Tee', image: 'https://images.pexels.com/photos/6765169/pexels-photo-6765169.jpeg?auto=compress&cs=tinysrgb&w=80', price: 59, quantity: 2, size: 'L', color: 'Black' },
      { productId: 3, name: 'Cargo Jogger Pants', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=80', price: 89, quantity: 1, size: '32', color: 'Olive' }
    ],
    subtotal: 207, shipping: 12, discount: 0, total: 219,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '142 Mulberry St, Apt 4B', city: 'New York', country: 'United States' }
  },
  {
    id: 'TAG-1002',
    customer: 'Jordan Williams',
    email: 'j.williams@email.com',
    phone: '+1 310-555-0283',
    date: '2026-08-10',
    items: [
      { productId: 2, name: 'Essential Hoodie', image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=80', price: 95, quantity: 1, size: 'XL', color: 'Gray' }
    ],
    subtotal: 95, shipping: 12, discount: 0, total: 107,
    paymentStatus: 'paid', orderStatus: 'processing',
    shippingAddress: { address: '8814 Wilshire Blvd', city: 'Los Angeles', country: 'United States' }
  },
  {
    id: 'TAG-1003',
    customer: 'Kai Nakamura',
    email: 'kai.n@email.com',
    phone: '+44 20-7946-0958',
    date: '2026-08-09',
    items: [
      { productId: 5, name: 'Graphic Print Tee', image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=80', price: 55, quantity: 3, size: 'M', color: 'White' },
      { productId: 8, name: 'Washed Denim Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 145, quantity: 1, size: 'L', color: 'Blue' }
    ],
    subtotal: 310, shipping: 0, discount: 31, total: 279,
    paymentStatus: 'paid', orderStatus: 'shipped',
    shippingAddress: { address: '23 Shoreditch High St', city: 'London', country: 'United Kingdom' }
  },
  {
    id: 'TAG-1004',
    customer: 'Dante Moore',
    email: 'dante.m@email.com',
    phone: '+1 773-555-0194',
    date: '2026-08-09',
    items: [
      { productId: 4, name: 'Tech Fleece Joggers', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=80', price: 79, quantity: 1, size: '30', color: 'Black' },
      { productId: 6, name: 'Relaxed Oxford Shirt', image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=80', price: 75, quantity: 1, size: 'M', color: 'White' }
    ],
    subtotal: 154, shipping: 12, discount: 0, total: 166,
    paymentStatus: 'pending', orderStatus: 'pending',
    shippingAddress: { address: '456 Michigan Ave', city: 'Chicago', country: 'United States' }
  },
  {
    id: 'TAG-1005',
    customer: 'Liam O\'Brien',
    email: 'liam.ob@email.com',
    phone: '+353 1-555-0166',
    date: '2026-08-08',
    items: [
      { productId: 7, name: 'Bomber Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 165, quantity: 1, size: 'L', color: 'Black' }
    ],
    subtotal: 165, shipping: 18, discount: 0, total: 183,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '78 Grafton St', city: 'Dublin', country: 'Ireland' }
  },
  {
    id: 'TAG-1006',
    customer: 'Ethan Brooks',
    email: 'e.brooks@email.com',
    phone: '+1 415-555-0312',
    date: '2026-08-08',
    items: [
      { productId: 9, name: 'Classic Sneakers', image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=80', price: 120, quantity: 1, size: '10', color: 'White' },
      { productId: 1, name: 'Oversized Logo Tee', image: 'https://images.pexels.com/photos/6765169/pexels-photo-6765169.jpeg?auto=compress&cs=tinysrgb&w=80', price: 59, quantity: 2, size: 'M', color: 'Black' }
    ],
    subtotal: 238, shipping: 0, discount: 0, total: 238,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '1200 Market St', city: 'San Francisco', country: 'United States' }
  },
  {
    id: 'TAG-1007',
    customer: 'Noah Kim',
    email: 'noah.kim@email.com',
    phone: '+82 2-555-0891',
    date: '2026-08-07',
    items: [
      { productId: 2, name: 'Essential Hoodie', image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=80', price: 95, quantity: 1, size: 'L', color: 'Black' },
      { productId: 4, name: 'Tech Fleece Joggers', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=80', price: 79, quantity: 1, size: '32', color: 'Gray' },
      { productId: 10, name: 'Leather Belt', image: 'https://images.pexels.com/photos/6894/pexels-photo-6894.jpeg?auto=compress&cs=tinysrgb&w=80', price: 45, quantity: 1, size: 'One Size', color: 'Black' }
    ],
    subtotal: 219, shipping: 15, discount: 0, total: 234,
    paymentStatus: 'failed', orderStatus: 'cancelled',
    shippingAddress: { address: '342 Gangnam-daero', city: 'Seoul', country: 'South Korea' }
  },
  {
    id: 'TAG-1008',
    customer: 'Omar Hassan',
    email: 'omar.h@email.com',
    phone: '+971 4-555-0274',
    date: '2026-08-07',
    items: [
      { productId: 8, name: 'Washed Denim Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 145, quantity: 1, size: 'XL', color: 'Blue' },
      { productId: 6, name: 'Relaxed Oxford Shirt', image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=80', price: 75, quantity: 2, size: 'L', color: 'Blue' }
    ],
    subtotal: 295, shipping: 22, discount: 29, total: 288,
    paymentStatus: 'refunded', orderStatus: 'cancelled',
    shippingAddress: { address: 'Downtown Dubai, Sheikh Zayed Rd', city: 'Dubai', country: 'UAE' }
  },
  {
    id: 'TAG-1009',
    customer: 'Alex Rivera',
    email: 'alex.r@email.com',
    phone: '+1 786-555-0153',
    date: '2026-08-06',
    items: [
      { productId: 3, name: 'Cargo Jogger Pants', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=80', price: 89, quantity: 2, size: '30', color: 'Black' },
      { productId: 5, name: 'Graphic Print Tee', image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=80', price: 55, quantity: 1, size: 'L', color: 'Black' }
    ],
    subtotal: 233, shipping: 12, discount: 0, total: 245,
    paymentStatus: 'paid', orderStatus: 'processing',
    shippingAddress: { address: '2200 Coral Way', city: 'Miami', country: 'United States' }
  },
  {
    id: 'TAG-1010',
    customer: 'Tyler Jackson',
    email: 'tyler.j@email.com',
    phone: '+1 404-555-0287',
    date: '2026-08-06',
    items: [
      { productId: 7, name: 'Bomber Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 165, quantity: 1, size: 'M', color: 'Olive' },
      { productId: 9, name: 'Classic Sneakers', image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=80', price: 120, quantity: 1, size: '11', color: 'White' }
    ],
    subtotal: 285, shipping: 12, discount: 0, total: 297,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '75 Peachtree St NE', city: 'Atlanta', country: 'United States' }
  },
  {
    id: 'TAG-1011',
    customer: 'Ravi Patel',
    email: 'ravi.p@email.com',
    phone: '+91 22-555-0419',
    date: '2026-08-05',
    items: [
      { productId: 1, name: 'Oversized Logo Tee', image: 'https://images.pexels.com/photos/6765169/pexels-photo-6765169.jpeg?auto=compress&cs=tinysrgb&w=80', price: 59, quantity: 1, size: 'M', color: 'White' },
      { productId: 2, name: 'Essential Hoodie', image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=80', price: 95, quantity: 1, size: 'L', color: 'Gray' },
      { productId: 10, name: 'Leather Belt', image: 'https://images.pexels.com/photos/6894/pexels-photo-6894.jpeg?auto=compress&cs=tinysrgb&w=80', price: 45, quantity: 1, size: 'One Size', color: 'Brown' }
    ],
    subtotal: 199, shipping: 20, discount: 0, total: 219,
    paymentStatus: 'paid', orderStatus: 'shipped',
    shippingAddress: { address: 'Linking Road, Bandra West', city: 'Mumbai', country: 'India' }
  },
  {
    id: 'TAG-1012',
    customer: 'Chris Taylor',
    email: 'chris.t@email.com',
    phone: '+1 646-555-0398',
    date: '2026-08-05',
    items: [
      { productId: 5, name: 'Graphic Print Tee', image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=80', price: 55, quantity: 2, size: 'XL', color: 'Black' }
    ],
    subtotal: 110, shipping: 12, discount: 0, total: 122,
    paymentStatus: 'pending', orderStatus: 'pending',
    shippingAddress: { address: '99 Orchard St', city: 'New York', country: 'United States' }
  },
  {
    id: 'TAG-1013',
    customer: 'Samuel Wright',
    email: 'sam.w@email.com',
    phone: '+1 512-555-0261',
    date: '2026-08-04',
    items: [
      { productId: 3, name: 'Cargo Jogger Pants', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=80', price: 89, quantity: 1, size: '34', color: 'Olive' },
      { productId: 8, name: 'Washed Denim Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 145, quantity: 1, size: 'L', color: 'Blue' },
      { productId: 6, name: 'Relaxed Oxford Shirt', image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=80', price: 75, quantity: 1, size: 'M', color: 'White' }
    ],
    subtotal: 309, shipping: 12, discount: 0, total: 321,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '501 Congress Ave', city: 'Austin', country: 'United States' }
  },
  {
    id: 'TAG-1014',
    customer: 'Daniel Lee',
    email: 'daniel.lee@email.com',
    phone: '+1 206-555-0445',
    date: '2026-08-03',
    items: [
      { productId: 9, name: 'Classic Sneakers', image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=80', price: 120, quantity: 1, size: '9', color: 'White' }
    ],
    subtotal: 120, shipping: 12, discount: 12, total: 120,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '400 Pike St', city: 'Seattle', country: 'United States' }
  },
  {
    id: 'TAG-1015',
    customer: 'Jake Morrison',
    email: 'jake.m@email.com',
    phone: '+61 2-555-0178',
    date: '2026-08-02',
    items: [
      { productId: 4, name: 'Tech Fleece Joggers', image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=80', price: 79, quantity: 2, size: 'L', color: 'Black' },
      { productId: 7, name: 'Bomber Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 165, quantity: 1, size: 'M', color: 'Black' }
    ],
    subtotal: 323, shipping: 25, discount: 0, total: 348,
    paymentStatus: 'paid', orderStatus: 'shipped',
    shippingAddress: { address: '88 George St', city: 'Sydney', country: 'Australia' }
  },
  {
    id: 'TAG-1016',
    customer: 'Andre Thompson',
    email: 'andre.t@email.com',
    phone: '+1 202-555-0389',
    date: '2026-08-01',
    items: [
      { productId: 2, name: 'Essential Hoodie', image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=80', price: 95, quantity: 1, size: 'M', color: 'Black' }
    ],
    subtotal: 95, shipping: 12, discount: 0, total: 107,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '1600 Pennsylvania Ave NW', city: 'Washington', country: 'United States' }
  },
  {
    id: 'TAG-1017',
    customer: 'Miles Carter',
    email: 'miles.c@email.com',
    phone: '+1 504-555-0521',
    date: '2026-07-31',
    items: [
      { productId: 6, name: 'Relaxed Oxford Shirt', image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=80', price: 75, quantity: 2, size: 'L', color: 'White' },
      { productId: 5, name: 'Graphic Print Tee', image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=80', price: 55, quantity: 1, size: 'M', color: 'White' }
    ],
    subtotal: 205, shipping: 12, discount: 20, total: 197,
    paymentStatus: 'paid', orderStatus: 'completed',
    shippingAddress: { address: '300 Magazine St', city: 'New Orleans', country: 'United States' }
  },
  {
    id: 'TAG-1018',
    customer: 'Yusuf Ali',
    email: 'yusuf.a@email.com',
    phone: '+44 20-555-0633',
    date: '2026-07-30',
    items: [
      { productId: 8, name: 'Washed Denim Jacket', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=80', price: 145, quantity: 1, size: 'M', color: 'Blue' },
      { productId: 10, name: 'Leather Belt', image: 'https://images.pexels.com/photos/6894/pexels-photo-6894.jpeg?auto=compress&cs=tinysrgb&w=80', price: 45, quantity: 1, size: 'One Size', color: 'Black' }
    ],
    subtotal: 190, shipping: 14, discount: 0, total: 204,
    paymentStatus: 'paid', orderStatus: 'processing',
    shippingAddress: { address: '5 Brick Lane', city: 'London', country: 'United Kingdom' }
  }
];

// ---- CUSTOMERS ----
let MOCK_CUSTOMERS = [
  { id: 1, name: 'Marcus Chen', email: 'marcus.chen@email.com', phone: '+1 212-555-0147', address: '142 Mulberry St, New York, US', orders: 5, totalSpent: 879, lastOrder: '2026-08-10', status: 'active', joined: '2026-03-15' },
  { id: 2, name: 'Jordan Williams', email: 'j.williams@email.com', phone: '+1 310-555-0283', address: '8814 Wilshire Blvd, Los Angeles, US', orders: 3, totalSpent: 412, lastOrder: '2026-08-10', status: 'active', joined: '2026-04-22' },
  { id: 3, name: 'Kai Nakamura', email: 'kai.n@email.com', phone: '+44 20-7946-0958', address: '23 Shoreditch High St, London, UK', orders: 7, totalSpent: 1456, lastOrder: '2026-08-09', status: 'active', joined: '2026-01-08' },
  { id: 4, name: 'Dante Moore', email: 'dante.m@email.com', phone: '+1 773-555-0194', address: '456 Michigan Ave, Chicago, US', orders: 1, totalSpent: 166, lastOrder: '2026-08-09', status: 'active', joined: '2026-08-01' },
  { id: 5, name: "Liam O'Brien", email: 'liam.ob@email.com', phone: '+353 1-555-0166', address: '78 Grafton St, Dublin, IE', orders: 4, totalSpent: 683, lastOrder: '2026-08-08', status: 'active', joined: '2026-02-14' },
  { id: 6, name: 'Ethan Brooks', email: 'e.brooks@email.com', phone: '+1 415-555-0312', address: '1200 Market St, San Francisco, US', orders: 6, totalSpent: 1102, lastOrder: '2026-08-08', status: 'active', joined: '2026-01-20' },
  { id: 7, name: 'Noah Kim', email: 'noah.kim@email.com', phone: '+82 2-555-0891', address: '342 Gangnam-daero, Seoul, KR', orders: 2, totalSpent: 234, lastOrder: '2026-08-07', status: 'inactive', joined: '2026-05-10' },
  { id: 8, name: 'Omar Hassan', email: 'omar.h@email.com', phone: '+971 4-555-0274', address: 'Downtown Dubai, UAE', orders: 3, totalSpent: 597, lastOrder: '2026-08-07', status: 'active', joined: '2026-03-28' },
  { id: 9, name: 'Alex Rivera', email: 'alex.r@email.com', phone: '+1 786-555-0153', address: '2200 Coral Way, Miami, US', orders: 4, totalSpent: 745, lastOrder: '2026-08-06', status: 'active', joined: '2026-02-05' },
  { id: 10, name: 'Tyler Jackson', email: 'tyler.j@email.com', phone: '+1 404-555-0287', address: '75 Peachtree St NE, Atlanta, US', orders: 2, totalSpent: 397, lastOrder: '2026-08-06', status: 'active', joined: '2026-06-12' },
  { id: 11, name: 'Ravi Patel', email: 'ravi.p@email.com', phone: '+91 22-555-0419', address: 'Linking Road, Bandra West, Mumbai, IN', orders: 5, totalSpent: 821, lastOrder: '2026-08-05', status: 'active', joined: '2026-01-30' },
  { id: 12, name: 'Chris Taylor', email: 'chris.t@email.com', phone: '+1 646-555-0398', address: '99 Orchard St, New York, US', orders: 1, totalSpent: 122, lastOrder: '2026-08-05', status: 'active', joined: '2026-08-02' },
  { id: 13, name: 'Samuel Wright', email: 'sam.w@email.com', phone: '+1 512-555-0261', address: '501 Congress Ave, Austin, US', orders: 3, totalSpent: 528, lastOrder: '2026-08-04', status: 'active', joined: '2026-04-15' },
  { id: 14, name: 'Daniel Lee', email: 'daniel.lee@email.com', phone: '+1 206-555-0445', address: '400 Pike St, Seattle, US', orders: 8, totalSpent: 1680, lastOrder: '2026-08-03', status: 'active', joined: '2025-11-20' },
  { id: 15, name: 'Jake Morrison', email: 'jake.m@email.com', phone: '+61 2-555-0178', address: '88 George St, Sydney, AU', orders: 2, totalSpent: 491, lastOrder: '2026-08-02', status: 'active', joined: '2026-06-25' },
  { id: 16, name: 'Andre Thompson', email: 'andre.t@email.com', phone: '+1 202-555-0389', address: '1600 Pennsylvania Ave NW, Washington, US', orders: 1, totalSpent: 107, lastOrder: '2026-08-01', status: 'inactive', joined: '2026-07-18' },
  { id: 17, name: 'Miles Carter', email: 'miles.c@email.com', phone: '+1 504-555-0521', address: '300 Magazine St, New Orleans, US', orders: 3, totalSpent: 419, lastOrder: '2026-07-31', status: 'active', joined: '2026-05-03' },
  { id: 18, name: 'Yusuf Ali', email: 'yusuf.a@email.com', phone: '+44 20-555-0633', address: '5 Brick Lane, London, UK', orders: 6, totalSpent: 1134, lastOrder: '2026-07-30', status: 'active', joined: '2026-02-28' }
];

// ---- ANALYTICS (pre-computed for each date range) ----
const ANALYTICS_DATA = {
  '7d': {
    revenue: 2847, orders: 12, customers: 10, avgOrderValue: 237.25, conversionRate: 3.2,
    revenueByDay: [
      { label: 'Mon', value: 321 }, { label: 'Tue', value: 445 }, { label: 'Wed', value: 389 },
      { label: 'Thu', value: 512 }, { label: 'Fri', value: 467 }, { label: 'Sat', value: 398 }, { label: 'Sun', value: 315 }
    ],
    ordersByDay: [
      { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 }, { label: 'Wed', value: 1 },
      { label: 'Thu', value: 3 }, { label: 'Fri', value: 2 }, { label: 'Sat', value: 2 }, { label: 'Sun', value: 1 }
    ],
    salesByCategory: [
      { label: 'Hoodies', value: 385 }, { label: 'T-Shirts', value: 412 }, { label: 'Pants', value: 534 },
      { label: 'Shirts', value: 225 }, { label: 'Jackets', value: 731 }, { label: 'Shoes', value: 360 }, { label: 'Accessories', value: 200 }
    ],
    topProducts: [
      { name: 'Bomber Jacket', sold: 4, revenue: 660 },
      { name: 'Cargo Jogger Pants', sold: 5, revenue: 445 },
      { name: 'Oversized Logo Tee', sold: 7, revenue: 413 },
      { name: 'Washed Denim Jacket', sold: 3, revenue: 435 },
      { name: 'Essential Hoodie', sold: 4, revenue: 380 }
    ]
  },
  '30d': {
    revenue: 18450, orders: 78, customers: 52, avgOrderValue: 236.54, conversionRate: 3.8,
    revenueByDay: [
      { label: 'W1', value: 4200 }, { label: 'W2', value: 4850 }, { label: 'W3', value: 5100 }, { label: 'W4', value: 4300 }
    ],
    ordersByDay: [
      { label: 'W1', value: 18 }, { label: 'W2', value: 21 }, { label: 'W3', value: 22 }, { label: 'W4', value: 17 }
    ],
    salesByCategory: [
      { label: 'Hoodies', value: 3200 }, { label: 'T-Shirts', value: 3800 }, { label: 'Pants', value: 4100 },
      { label: 'Shirts', value: 1800 }, { label: 'Jackets', value: 3500 }, { label: 'Shoes', value: 1550 }, { label: 'Accessories', value: 500 }
    ],
    topProducts: [
      { name: 'Essential Hoodie', sold: 18, revenue: 1710 },
      { name: 'Cargo Jogger Pants', sold: 22, revenue: 1958 },
      { name: 'Oversized Logo Tee', sold: 25, revenue: 1475 },
      { name: 'Bomber Jacket', sold: 12, revenue: 1980 },
      { name: 'Classic Sneakers', sold: 14, revenue: 1680 }
    ]
  },
  '90d': {
    revenue: 58200, orders: 246, customers: 134, avgOrderValue: 236.59, conversionRate: 4.1,
    revenueByDay: [
      { label: 'Jun', value: 18200 }, { label: 'Jul', value: 20100 }, { label: 'Aug', value: 19900 }
    ],
    ordersByDay: [
      { label: 'Jun', value: 78 }, { label: 'Jul', value: 86 }, { label: 'Aug', value: 82 }
    ],
    salesByCategory: [
      { label: 'Hoodies', value: 9800 }, { label: 'T-Shirts', value: 11200 }, { label: 'Pants', value: 13500 },
      { label: 'Shirts', value: 5600 }, { label: 'Jackets', value: 10800 }, { label: 'Shoes', value: 5100 }, { label: 'Accessories', value: 2200 }
    ],
    topProducts: [
      { name: 'Cargo Jogger Pants', sold: 68, revenue: 6052 },
      { name: 'Essential Hoodie', sold: 55, revenue: 5225 },
      { name: 'Oversized Logo Tee', sold: 72, revenue: 4248 },
      { name: 'Bomber Jacket', sold: 35, revenue: 5775 },
      { name: 'Classic Sneakers', sold: 38, revenue: 4560 }
    ]
  },
  'year': {
    revenue: 245800, orders: 1038, customers: 487, avgOrderValue: 236.81, conversionRate: 3.9,
    revenueByDay: [
      { label: 'Jan', value: 15800 }, { label: 'Feb', value: 14200 }, { label: 'Mar', value: 18400 },
      { label: 'Apr', value: 20100 }, { label: 'May', value: 22800 }, { label: 'Jun', value: 19500 },
      { label: 'Jul', value: 21200 }, { label: 'Aug', value: 20400 }, { label: 'Sep', value: 18900 },
      { label: 'Oct', value: 22100 }, { label: 'Nov', value: 26500 }, { label: 'Dec', value: 25900 }
    ],
    ordersByDay: [
      { label: 'Jan', value: 68 }, { label: 'Feb', value: 60 }, { label: 'Mar', value: 78 },
      { label: 'Apr', value: 85 }, { label: 'May', value: 96 }, { label: 'Jun', value: 82 },
      { label: 'Jul', value: 90 }, { label: 'Aug', value: 86 }, { label: 'Sep', value: 80 },
      { label: 'Oct', value: 93 }, { label: 'Nov', value: 112 }, { label: 'Dec', value: 108 }
    ],
    salesByCategory: [
      { label: 'Hoodies', value: 38500 }, { label: 'T-Shirts', value: 44800 }, { label: 'Pants', value: 54200 },
      { label: 'Shirts', value: 22400 }, { label: 'Jackets', value: 43200 }, { label: 'Shoes', value: 28200 }, { label: 'Accessories', value: 14500 }
    ],
    topProducts: [
      { name: 'Cargo Jogger Pants', sold: 280, revenue: 24920 },
      { name: 'Essential Hoodie', sold: 220, revenue: 20900 },
      { name: 'Oversized Logo Tee', sold: 295, revenue: 17405 },
      { name: 'Bomber Jacket', sold: 140, revenue: 23100 },
      { name: 'Classic Sneakers', sold: 155, revenue: 18600 }
    ]
  }
};
