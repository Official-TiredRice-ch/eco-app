# Backend API Integration Guide

## Overview

The app automatically discovers and connects to your backend server on the local network. No manual IP configuration needed!

## How It Works

1. **Automatic Discovery**: When the app starts, it automatically scans the local network for the backend server
2. **Caching**: Once found, the backend URL is cached for 1 hour to avoid repeated scanning
3. **Fallback**: If discovery fails, you can manually reconnect by tapping the status indicator

## Installation

First, install the required dependencies:

```bash
cd frontend/eco-app
npm install
```

## Backend Requirements

Your backend must have:
- A `/health` endpoint that returns a 200 status
- Running on port `24365` (configurable in `services/api.ts`)
- CORS enabled (your backend already has this)

## Usage

### Using the API Service

```typescript
import { apiService } from '@/services/api';

// GET request
const products = await apiService.get('/api/products');

// POST request
const newProduct = await apiService.post('/api/products', {
  name: 'Product Name',
  price: 99.99
});

// PUT request
const updated = await apiService.put('/api/products/1', {
  name: 'Updated Name'
});

// DELETE request
await apiService.delete('/api/products/1');
```

### Using the Hook

```typescript
import { useApi } from '@/hooks/use-api';

export function ProductList() {
  const { data: products, loading, error } = useApi('/api/products');

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### Using the Context

```typescript
import { useApiContext } from '@/context/api-context';

export function MyComponent() {
  const { baseUrl, isConnected, reconnect } = useApiContext();

  return (
    <View>
      <Text>Connected: {isConnected ? 'Yes' : 'No'}</Text>
      <Text>Backend: {baseUrl}</Text>
      <Button title="Reconnect" onPress={reconnect} />
    </View>
  );
}
```

## Backend Status Indicator

The home page shows a status indicator that displays:
- 🟢 **Connected**: Backend is reachable
- 🟡 **Connecting**: Scanning for backend
- 🔴 **Disconnected**: Backend not found

Tap the indicator to manually reconnect.

## Troubleshooting

### Backend Not Found

1. Make sure backend is running: `npm start` in the backend folder
2. Check that both devices are on the same WiFi network
3. Verify backend port is `24365`
4. Check firewall settings

### Connection Timeout

- Increase `DISCOVERY_TIMEOUT` in `services/api.ts`
- Check network connectivity
- Verify backend is responding to `/health` requests

### Clear Cache

To force a new discovery:

```typescript
import { apiService } from '@/services/api';

await apiService.clearCache();
```

## API Endpoints

Your backend provides these endpoints:

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - Get all categories
- `GET /api/wishlist` - Get wishlist items
- `POST /api/wishlist` - Add to wishlist
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart

## Next Steps

Now you can:
1. Create product list screens that fetch from `/api/products`
2. Implement add to cart functionality
3. Build wishlist management
4. Create user authentication

Happy coding! 🚀
