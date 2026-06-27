/**
 * ShopVerse Database Seeder
 * Run: node seed.js
 * Seeds: admin, vendor, customer accounts + categories + products
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const { Category, Vendor } = require('./models/index');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopverse';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', description: 'Gadgets, phones, laptops and more' },
  { name: 'Fashion', icon: '👗', description: 'Clothing, shoes and accessories' },
  { name: 'Home & Living', icon: '🏠', description: 'Furniture, decor, and essentials' },
  { name: 'Books', icon: '📚', description: 'Fiction, non-fiction, textbooks' },
  { name: 'Sports', icon: '⚽', description: 'Sports gear and equipment' },
  { name: 'Beauty', icon: '💄', description: 'Skincare, makeup and wellness' },
  { name: 'Gaming', icon: '🎮', description: 'Consoles, games and accessories' },
  { name: 'Food & Health', icon: '🍎', description: 'Organic food and supplements' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Vendor.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ─── Create Categories ───────────────────────────────────
    const cats = await Category.insertMany(CATEGORIES);
    console.log(`📁 Created ${cats.length} categories`);

    const catMap = {};
    cats.forEach((c) => { catMap[c.name] = c._id; });

    // ─── Create Admin ─────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'demo123',
      role: 'admin',
    });
    console.log('👑 Admin created: admin@demo.com / demo123');

    // ─── Create Vendors ───────────────────────────────────────
    const vendorUser = await User.create({
      name: 'Tech Store',
      email: 'vendor@demo.com',
      password: 'demo123',
      role: 'vendor',
    });

    const vendorUser2 = await User.create({
      name: 'Fashion Hub',
      email: 'fashion@demo.com',
      password: 'demo123',
      role: 'vendor',
    });

    await Vendor.create({
      user: vendorUser._id,
      storeName: 'TechVerse Store',
      storeDescription: 'Your one-stop shop for all tech gadgets',
      isApproved: true,
      totalRevenue: 45200,
      totalSales: 312,
      rating: 4.7,
      category: 'Electronics',
    });

    await Vendor.create({
      user: vendorUser2._id,
      storeName: 'Fashion Hub',
      storeDescription: 'Trendy fashion for everyone',
      isApproved: true,
      totalRevenue: 28900,
      totalSales: 187,
      rating: 4.5,
      category: 'Fashion',
    });

    console.log('🏪 Vendors created: vendor@demo.com / demo123, fashion@demo.com / demo123');

    // ─── Create Customer ──────────────────────────────────────
    await User.create({
      name: 'John Customer',
      email: 'customer@demo.com',
      password: 'demo123',
      role: 'customer',
      phone: '+1-555-0101',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
    });
    console.log('🛍️  Customer created: customer@demo.com / demo123');

    // ─── Create Products ──────────────────────────────────────
    const PRODUCTS = [
      // Electronics
      { name: 'iPhone 15 Pro Max', description: 'The latest Apple flagship with titanium design, A17 Pro chip, and an incredible camera system with 5x optical zoom.', category: catMap['Electronics'], brand: 'Apple', price: 1199.99, discountPrice: 1099.99, stock: 50, isFeatured: true, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'], soldCount: 234, vendor: vendorUser._id },
      { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung\'s most powerful phone with built-in S Pen, 200MP camera, and AI-powered features.', category: catMap['Electronics'], brand: 'Samsung', price: 1299.99, discountPrice: 1199.99, stock: 35, isFeatured: true, images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop'], soldCount: 187, vendor: vendorUser._id },
      { name: 'MacBook Pro 14" M3 Pro', description: 'Apple M3 Pro chip, Liquid Retina XDR display, up to 22 hours battery life. The pro laptop redefined.', category: catMap['Electronics'], brand: 'Apple', price: 1999.99, discountPrice: null, stock: 20, isFeatured: true, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'], soldCount: 89, vendor: vendorUser._id },
      { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling headphones with 30-hour battery and crystal-clear hands-free calling.', category: catMap['Electronics'], brand: 'Sony', price: 399.99, discountPrice: 279.99, stock: 80, isFeatured: false, images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'], soldCount: 456, vendor: vendorUser._id },
      { name: 'iPad Air 5th Gen', description: '10.9-inch Liquid Retina display, M1 chip, 5G capable. Perfect for creativity on the go.', category: catMap['Electronics'], brand: 'Apple', price: 749.99, discountPrice: 699.99, stock: 45, isFeatured: false, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'], soldCount: 178, vendor: vendorUser._id },
      { name: 'Dell XPS 15 Laptop', description: '15.6" OLED display, Intel Core i9, 32GB RAM, 1TB SSD. Ultimate performance for creators.', category: catMap['Electronics'], brand: 'Dell', price: 2299.99, discountPrice: 1999.99, stock: 15, isFeatured: false, images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop'], soldCount: 67, vendor: vendorUser._id },
      { name: 'Nintendo Switch OLED', description: 'Vibrant 7-inch OLED screen, enhanced audio, 64GB storage, and adjustable stand.', category: catMap['Gaming'], brand: 'Nintendo', price: 349.99, discountPrice: 299.99, stock: 60, isFeatured: true, images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop'], soldCount: 321, vendor: vendorUser._id },
      { name: 'PlayStation 5 Console', description: 'Experience lightning-fast loading with SSD, deeper immersion with haptic feedback and adaptive triggers.', category: catMap['Gaming'], brand: 'Sony', price: 499.99, discountPrice: null, stock: 10, isFeatured: true, images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'], soldCount: 145, vendor: vendorUser._id },

      // Fashion
      { name: 'Premium Leather Jacket', description: 'Genuine full-grain leather jacket with quilted lining, perfect for all seasons. Timeless style meets modern comfort.', category: catMap['Fashion'], brand: 'LeatherCraft', price: 299.99, discountPrice: 249.99, stock: 40, isFeatured: true, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'], soldCount: 132, vendor: vendorUser2._id },
      { name: 'Designer Silk Dress', description: 'Elegant 100% pure silk midi dress with floral print. Perfect for special occasions and evening events.', category: catMap['Fashion'], brand: 'LuxeMode', price: 189.99, discountPrice: 149.99, stock: 25, isFeatured: true, images: ['https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400&h=400&fit=crop'], soldCount: 89, vendor: vendorUser2._id },
      { name: 'Classic White Sneakers', description: 'Minimalist clean white leather sneakers with cushioned insole. Pairs with everything.', category: catMap['Fashion'], brand: 'StepStyle', price: 129.99, discountPrice: 89.99, stock: 100, isFeatured: false, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'], soldCount: 445, vendor: vendorUser2._id },
      { name: 'Slim Fit Chino Pants', description: 'Premium stretch cotton chinos available in multiple colors. Office-to-weekend versatility.', category: catMap['Fashion'], brand: 'UrbanThread', price: 79.99, discountPrice: 59.99, stock: 75, isFeatured: false, images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop'], soldCount: 267, vendor: vendorUser2._id },

      // Home & Living
      { name: 'Scandi Sofa Set', description: 'Minimalist 3-seater sofa with premium fabric upholstery and solid wood legs. Scandinavian design.', category: catMap['Home & Living'], brand: 'HomeEssence', price: 1299.99, discountPrice: 999.99, stock: 8, isFeatured: true, images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop'], soldCount: 34, vendor: vendorUser._id },
      { name: 'Ceramic Coffee Mug Set', description: 'Set of 6 handcrafted ceramic mugs in earthy tones. Dishwasher and microwave safe.', category: catMap['Home & Living'], brand: 'CeramicArt', price: 49.99, discountPrice: 34.99, stock: 120, isFeatured: false, images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop'], soldCount: 312, vendor: vendorUser._id },

      // Beauty
      { name: 'Vitamin C Serum', description: '20% pure vitamin C serum for brightening, anti-aging, and radiant skin. Dermatologist tested.', category: catMap['Beauty'], brand: 'GlowLab', price: 59.99, discountPrice: 44.99, stock: 90, isFeatured: true, images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop'], soldCount: 678, vendor: vendorUser2._id },
      { name: 'Luxury Perfume Set', description: 'Gift set of 4 premium eau de parfum mini bottles. Long-lasting and sophisticated fragrance.', category: catMap['Beauty'], brand: 'FragranceWorld', price: 119.99, discountPrice: 89.99, stock: 55, isFeatured: false, images: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=400&fit=crop'], soldCount: 234, vendor: vendorUser2._id },

      // Books
      { name: 'Atomic Habits', description: 'James Clear\'s #1 bestseller on building good habits and breaking bad ones. Over 15 million copies sold.', category: catMap['Books'], brand: 'Penguin Books', price: 24.99, discountPrice: 16.99, stock: 200, isFeatured: false, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop'], soldCount: 892, vendor: vendorUser._id },
      { name: 'The Psychology of Money', description: 'Morgan Housel\'s timeless lessons on wealth, greed, and happiness. A must-read for financial success.', category: catMap['Books'], brand: 'Harriman House', price: 19.99, discountPrice: 13.99, stock: 150, isFeatured: false, images: ['https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=400&fit=crop'], soldCount: 567, vendor: vendorUser._id },

      // Sports
      { name: 'Pro Yoga Mat', description: 'Extra thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material. Includes carry strap.', category: catMap['Sports'], brand: 'FlexFit', price: 79.99, discountPrice: 59.99, stock: 65, isFeatured: false, images: ['https://images.unsplash.com/photo-1601925228226-4cd23be4e4c5?w=400&h=400&fit=crop'], soldCount: 389, vendor: vendorUser._id },
      { name: 'Adjustable Dumbbell Set', description: '5-52.5 lbs adjustable dumbbells. Replace 15 sets of weights. Quick-change dial system.', category: catMap['Sports'], brand: 'IronCore', price: 349.99, discountPrice: 299.99, stock: 20, isFeatured: true, images: ['https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=400&fit=crop'], soldCount: 123, vendor: vendorUser._id },
    ];

    const products = await Product.insertMany(PRODUCTS);
    console.log(`📦 Created ${products.length} products`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Demo Credentials:');
    console.log('  Admin:    admin@demo.com    / demo123');
    console.log('  Vendor:   vendor@demo.com   / demo123');
    console.log('  Vendor 2: fashion@demo.com  / demo123');
    console.log('  Customer: customer@demo.com / demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
