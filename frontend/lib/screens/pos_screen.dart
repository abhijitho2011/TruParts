import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  List<Product> _products = [];
  final Map<Product, int> _cart = {};

  void _search() async {
    final results = await _apiService.getProducts(_searchController.text);
    setState(() {
      _products = results;
    });
  }

  void _addToCart(Product product) {
    setState(() {
      _cart[product] = (_cart[product] ?? 0) + 1;
    });
  }

  void _checkout() async {
    // Basic checkout logic
    List<Map<String, dynamic>> items = _cart.entries.map((entry) {
      return {
        'productId': entry.key.id,
        'quantity': entry.value,
        'price': entry.key.salePrice,
        'taxRate': 18.0, // Hardcoded for now, should come from product
      };
    }).toList();

    final checkoutData = {
      'items': items,
      'isCashSale': true, // Default to cash for now
      'paymentMethod': 'cash',
      'paidAmount': _calculateTotal(), // Full payment assumption
    };

    try {
      await _apiService.createInvoice(checkoutData);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Invoice Created!')));
        setState(() {
          _cart.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  double _calculateTotal() {
    return _cart.entries.fold(
      0,
      (sum, entry) => sum + (entry.key.salePrice * entry.value),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('POS & Billing')),
      body: Row(
        children: [
          // Search & Inventory Section
          Expanded(
            flex: 2,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      labelText: 'Search Product',
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.search),
                        onPressed: _search,
                      ),
                    ),
                    onSubmitted: (_) => _search(),
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _products.length,
                    itemBuilder: (ctx, i) {
                      final p = _products[i];
                      return ListTile(
                        title: Text(p.itemName),
                        subtitle: Text(
                          '${p.sku} | Stock: ${p.stock} | ₹${p.salePrice}',
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.add_shopping_cart),
                          onPressed: () => _addToCart(p),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          const VerticalDivider(width: 1),
          // Cart Section
          Expanded(
            flex: 1,
            child: Column(
              children: [
                AppBar(
                  title: const Text('Cart'),
                  automaticallyImplyLeading: false,
                ),
                Expanded(
                  child: ListView(
                    children: _cart.entries.map((entry) {
                      return ListTile(
                        title: Text(entry.key.itemName),
                        subtitle: Text(
                          '${entry.value} x ₹${entry.key.salePrice}',
                        ),
                        trailing: Text(
                          '₹${(entry.value * entry.key.salePrice).toStringAsFixed(2)}',
                        ),
                      );
                    }).toList(),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text(
                        'Total: ₹${_calculateTotal().toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: _cart.isEmpty ? null : _checkout,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        child: const Text('CHECKOUT (CASH)'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
