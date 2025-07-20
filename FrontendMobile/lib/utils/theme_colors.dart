import 'package:flutter/material.dart';

class ThemeColors {
  static Color getPrimaryColor(BuildContext context) {
    return Theme.of(context).colorScheme.primary;
  }

  static Color getSecondaryColor(BuildContext context) {
    return Theme.of(context).colorScheme.secondary;
  }

  static Color getBackgroundColor(BuildContext context) {
    return Theme.of(context).colorScheme.background;
  }

  static Color getSurfaceColor(BuildContext context) {
    return Theme.of(context).colorScheme.surface;
  }

  static Color getOnBackgroundColor(BuildContext context) {
    return Theme.of(context).colorScheme.onBackground;
  }

  static Color getOnSurfaceColor(BuildContext context) {
    return Theme.of(context).colorScheme.onSurface;
  }

  static Color getTextPrimaryColor(BuildContext context) {
    return Theme.of(context).colorScheme.onBackground;
  }

  static Color getTextSecondaryColor(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark 
        ? Colors.grey[400]! 
        : Colors.grey[600]!;
  }

  static Color getCardColor(BuildContext context) {
    return Theme.of(context).cardColor;
  }

  static Color getErrorColor(BuildContext context) {
    return const Color(0xFFEF4444);
  }

  static Color getSuccessColor(BuildContext context) {
    return const Color(0xFF10B981);
  }

  static Color getWarningColor(BuildContext context) {
    return const Color(0xFFF59E0B);
  }

  static Color getInfoColor(BuildContext context) {
    return Theme.of(context).colorScheme.primary;
  }

  static Color getAccentColor(BuildContext context) {
    return const Color(0xFF10B981);
  }

  static Color getDividerColor(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark 
        ? Colors.grey[700]! 
        : Colors.grey[300]!;
  }

  static Color getShadowColor(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark 
        ? Colors.black.withOpacity(0.3) 
        : Colors.black.withOpacity(0.1);
  }

  static Color getGradientStartColor(BuildContext context) {
    return Theme.of(context).colorScheme.primary;
  }

  static Color getGradientEndColor(BuildContext context) {
    return Theme.of(context).colorScheme.secondary;
  }
} 