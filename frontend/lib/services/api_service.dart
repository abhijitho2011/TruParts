import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';

class ApiService {
  // Use environment variable for production, fallback to localhost for dev
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000',
  );

  Future<List<Product>> getProducts(String query) async {
    final response = await http.get(
      Uri.parse('$baseUrl/inventory?search=$query'),
    );

    if (response.statusCode == 200) {
      List jsonResponse = json.decode(response.body);
      return jsonResponse.map((item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  Future<void> createInvoice(Map<String, dynamic> checkoutData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sales/checkout'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(checkoutData),
    );
    if (response.statusCode != 201) {
      throw Exception('Failed to create invoice: ${response.body}');
    }
  }
}
