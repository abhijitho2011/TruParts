import 'package:flutter/material.dart';
import 'screens/pos_screen.dart';
import 'screens/inventory_screen.dart';

void main() {
  runApp(const TruPartsApp());
}

class TruPartsApp extends StatelessWidget {
  const TruPartsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TruParts ERP',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
        useMaterial3: true,
      ),
      home: const MainLayout(),
    );
  }
}

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = <Widget>[
    PosScreen(),
    InventoryScreen(),
    Center(child: Text('Reports (Coming Soon)')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            labelType: NavigationRailLabelType.all,
            destinations: const <NavigationRailDestination>[
              NavigationRailDestination(
                icon: Icon(Icons.point_of_sale),
                label: Text('POS'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.inventory),
                label: Text('Inventory'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.analytics),
                label: Text('Reports'),
              ),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: _screens[_selectedIndex]),
        ],
      ),
    );
  }
}
