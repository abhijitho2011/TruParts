class Product {
  final int id;
  final String itemName;
  final String sku;
  final String? make;
  final String? model;
  final String? variant;
  final double salePrice;
  final int stock;

  Product({
    required this.id,
    required this.itemName,
    required this.sku,
    this.make,
    this.model,
    this.variant,
    required this.salePrice,
    required this.stock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      itemName: json['itemName'],
      sku: json['sku'],
      make: json['make'],
      model: json['model'],
      variant: json['variant'],
      salePrice: double.parse(json['salePrice'].toString()),
      stock: json['stock'],
    );
  }
}
