import 'package:flutter/material.dart';
import 'ui_utils.dart';
import 'constants.dart';

class ScreenUtils {
  // Common scaffold with app bar
  static Scaffold getScaffold({
    required BuildContext context,
    required String title,
    required Widget body,
    List<Widget>? actions,
    Widget? floatingActionButton,
    Widget? drawer,
    Widget? bottomNavigationBar,
    bool automaticallyImplyLeading = true,
    Widget? leading,
  }) {
    return Scaffold(
      appBar: UIUtils.getAppBar(
        title: title,
        actions: actions,
        automaticallyImplyLeading: automaticallyImplyLeading,
        leading: leading,
      ),
      body: body,
      floatingActionButton: floatingActionButton,
      drawer: drawer,
      bottomNavigationBar: bottomNavigationBar,
      backgroundColor: AppColors.background,
    );
  }

  // Common scaffold without app bar
  static Scaffold getScaffoldWithoutAppBar({
    required Widget body,
    Widget? floatingActionButton,
    Widget? drawer,
    Widget? bottomNavigationBar,
  }) {
    return Scaffold(
      body: body,
      floatingActionButton: floatingActionButton,
      drawer: drawer,
      bottomNavigationBar: bottomNavigationBar,
      backgroundColor: AppColors.background,
    );
  }

  // Common loading screen
  static Widget getLoadingScreen({String? message}) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            if (message != null) ...[
              const SizedBox(height: 16),
              Text(
                message,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // Common error screen
  static Widget getErrorScreen({
    required String message,
    VoidCallback? onRetry,
    VoidCallback? onBack,
  }) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: onBack != null
          ? UIUtils.getAppBar(
              title: 'Error',
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: onBack,
              ),
            )
          : null,
      body: UIUtils.getErrorState(
        message: message,
        onRetry: onRetry,
      ),
    );
  }

  // Common empty screen
  static Widget getEmptyScreen({
    required String message,
    String? subtitle,
    IconData? icon,
    VoidCallback? onAction,
    String? actionText,
  }) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.inbox_outlined,
              size: 64,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (onAction != null && actionText != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
                child: Text(actionText),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // Common list screen with pull to refresh
  static Widget getListScreen({
    required BuildContext context,
    required Widget child,
    required RefreshCallback onRefresh,
    bool isLoading = false,
    String? emptyMessage,
    String? errorMessage,
    VoidCallback? onRetry,
  }) {
    if (isLoading) {
      return getLoadingScreen();
    }

    if (errorMessage != null) {
      return getErrorScreen(
        message: errorMessage,
        onRetry: onRetry,
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: emptyMessage != null
          ? ListView(
              children: [
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.8,
                  child: UIUtils.getEmptyState(message: emptyMessage),
                ),
              ],
            )
          : child,
    );
  }

  // Common grid screen
  static Widget getGridScreen({
    required BuildContext context,
    required Widget child,
    required RefreshCallback onRefresh,
    bool isLoading = false,
    String? emptyMessage,
    String? errorMessage,
    VoidCallback? onRetry,
  }) {
    if (isLoading) {
      return getLoadingScreen();
    }

    if (errorMessage != null) {
      return getErrorScreen(
        message: errorMessage,
        onRetry: onRetry,
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: emptyMessage != null
          ? ListView(
              children: [
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.8,
                  child: UIUtils.getEmptyState(message: emptyMessage),
                ),
              ],
            )
          : child,
    );
  }

  // Common form screen
  static Widget getFormScreen({
    required BuildContext context,
    required String title,
    required Widget form,
    required VoidCallback onSubmit,
    String submitText = 'Submit',
    bool isLoading = false,
    List<Widget>? actions,
  }) {
    return getScaffold(
      context: context,
      title: title,
      actions: actions,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            form,
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : onSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(submitText),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Common detail screen
  static Widget getDetailScreen({
    required BuildContext context,
    required String title,
    required Widget content,
    List<Widget>? actions,
    Widget? floatingActionButton,
  }) {
    return getScaffold(
      context: context,
      title: title,
      actions: actions,
      floatingActionButton: floatingActionButton,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: content,
      ),
    );
  }

  // Common navigation helpers
  static void navigateTo(BuildContext context, Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  static void navigateToAndReplace(BuildContext context, Widget screen) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  static void navigateToAndClear(BuildContext context, Widget screen) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => screen),
      (route) => false,
    );
  }

  static void goBack(BuildContext context) {
    Navigator.of(context).pop();
  }

  static void goBackWithResult(BuildContext context, dynamic result) {
    Navigator.of(context).pop(result);
  }

  // Common dialog helpers
  static Future<T?> showCustomDialog<T>({
    required BuildContext context,
    required Widget child,
    bool barrierDismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      builder: (context) => child,
    );
  }

  static Future<bool> showConfirmDialog({
    required BuildContext context,
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
  }) {
    return UIUtils.showConfirmationDialog(
      context: context,
      title: title,
      message: message,
      confirmText: confirmText,
      cancelText: cancelText,
    );
  }

  // Common bottom sheet helpers
  static Future<T?> showBottomSheet<T>({
    required BuildContext context,
    required Widget child,
    bool isScrollControlled = false,
    bool isDismissible = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: isScrollControlled,
      isDismissible: isDismissible,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => child,
    );
  }

  // Common snackbar helpers
  static void showSuccessMessage(BuildContext context, String message) {
    UIUtils.showSuccessSnackBar(context, message);
  }

  static void showErrorMessage(BuildContext context, String message) {
    UIUtils.showErrorSnackBar(context, message);
  }

  static void showInfoMessage(BuildContext context, String message) {
    UIUtils.showInfoSnackBar(context, message);
  }

  static void showWarningMessage(BuildContext context, String message) {
    UIUtils.showWarningSnackBar(context, message);
  }
} 