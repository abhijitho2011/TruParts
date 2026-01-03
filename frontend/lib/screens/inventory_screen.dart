import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final ApiService _apiService = ApiService();
  List<Product> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  void _loadProducts() async {
    try {
      final products = await _apiService.getProducts('');
      setState(() {
        _products = products;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inventory Management')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _products.length,
              itemBuilder: (ctx, i) {
                final p = _products[i];
                return ListTile(
                  leading: CircleAvatar(child: Text(p.id.toString())),
                  title: Text(p.itemName),
                  subtitle: Text('SKU: ${p.sku} | Make: ${p.make ?? '-'}'),
                  trailing: Text('Stock: ${p.stock}'),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Implement Add Product Dialog
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Add Product Feature Coming Soon')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
