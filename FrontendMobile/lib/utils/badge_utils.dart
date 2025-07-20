class BadgeUtils {
  // Define all badge milestones
  static final List<Map<String, dynamic>> allMilestones = [
    {'count': 5, 'name': 'Quiz Beginner', 'emoji': '🥉', 'description': 'Solved 5 quizzes!'},
    {'count': 10, 'name': 'Quiz Explorer', 'emoji': '🥈', 'description': 'Solved 10 quizzes!'},
    {'count': 25, 'name': 'Quiz Enthusiast', 'emoji': '🥇', 'description': 'Solved 25 quizzes!'},
    {'count': 50, 'name': 'Quiz Master', 'emoji': '🏆', 'description': 'Solved 50 quizzes!'},
    {'count': 75, 'name': 'Quiz Champion', 'emoji': '👑', 'description': 'Solved 75 quizzes!'},
    {'count': 100, 'name': 'Century Club', 'emoji': '💯', 'description': 'Solved 100 quizzes!'},
    {'count': 200, 'name': 'Double Century', 'emoji': '🎯', 'description': 'Solved 200 quizzes!'},
    {'count': 300, 'name': 'Triple Century', 'emoji': '🎪', 'description': 'Solved 300 quizzes!'},
    {'count': 400, 'name': 'Quadruple Century', 'emoji': '🎨', 'description': 'Solved 400 quizzes!'},
    {'count': 500, 'name': 'Half Millennium', 'emoji': '🏆', 'description': 'Solved 500 quizzes!'},
    {'count': 600, 'name': 'Six Hundred', 'emoji': '⚡', 'description': 'Solved 600 quizzes!'},
    {'count': 700, 'name': 'Seven Hundred', 'emoji': '🔥', 'description': 'Solved 700 quizzes!'},
    {'count': 800, 'name': 'Eight Hundred', 'emoji': '💎', 'description': 'Solved 800 quizzes!'},
    {'count': 900, 'name': 'Nine Hundred', 'emoji': '🌟', 'description': 'Solved 900 quizzes!'},
    {'count': 1000, 'name': 'Millennium Master', 'emoji': '👑', 'description': 'Solved 1000 quizzes!'},
    {'count': 1200, 'name': 'Twelve Hundred', 'emoji': '🎪', 'description': 'Solved 1200 quizzes!'},
    {'count': 1400, 'name': 'Fourteen Hundred', 'emoji': '🎯', 'description': 'Solved 1400 quizzes!'},
    {'count': 1600, 'name': 'Sixteen Hundred', 'emoji': '⭐', 'description': 'Solved 1600 quizzes!'},
    {'count': 1800, 'name': 'Eighteen Hundred', 'emoji': '💎', 'description': 'Solved 1800 quizzes!'},
    {'count': 2000, 'name': 'Double Millennium', 'emoji': '👑🔥', 'description': 'Solved 2000 quizzes!'},
    {'count': 2200, 'name': 'Twenty-Two Hundred', 'emoji': '🎭', 'description': 'Solved 2200 quizzes!'},
    {'count': 2400, 'name': 'Twenty-Four Hundred', 'emoji': '🎨', 'description': 'Solved 2400 quizzes!'},
    {'count': 2600, 'name': 'Twenty-Six Hundred', 'emoji': '💫', 'description': 'Solved 2600 quizzes!'},
    {'count': 2800, 'name': 'Twenty-Eight Hundred', 'emoji': '🌟', 'description': 'Solved 2800 quizzes!'},
    {'count': 3000, 'name': 'Triple Millennium', 'emoji': '👑🔥💎', 'description': 'Solved 3000 quizzes!'},
    {'count': 3200, 'name': 'Thirty-Two Hundred', 'emoji': '🎯', 'description': 'Solved 3200 quizzes!'},
    {'count': 3400, 'name': 'Thirty-Four Hundred', 'emoji': '🎪', 'description': 'Solved 3400 quizzes!'},
    {'count': 3600, 'name': 'Thirty-Six Hundred', 'emoji': '🎨', 'description': 'Solved 3600 quizzes!'},
    {'count': 3800, 'name': 'Thirty-Eight Hundred', 'emoji': '💫', 'description': 'Solved 3800 quizzes!'},
    {'count': 4000, 'name': 'Quadruple Millennium', 'emoji': '👑🔥💎⭐', 'description': 'Solved 4000 quizzes!'},
    {'count': 4200, 'name': 'Forty-Two Hundred', 'emoji': '🎯', 'description': 'Solved 4200 quizzes!'},
    {'count': 4400, 'name': 'Forty-Four Hundred', 'emoji': '🎪', 'description': 'Solved 4400 quizzes!'},
    {'count': 4600, 'name': 'Forty-Six Hundred', 'emoji': '🎨', 'description': 'Solved 4600 quizzes!'},
    {'count': 4800, 'name': 'Forty-Eight Hundred', 'emoji': '💫', 'description': 'Solved 4800 quizzes!'},
    {'count': 5000, 'name': 'Quintuple Millennium', 'emoji': '👑🔥💎⭐🌟', 'description': 'Solved 5000 quizzes!'},
    {'count': 5200, 'name': 'Fifty-Two Hundred', 'emoji': '🎯', 'description': 'Solved 5200 quizzes!'},
    {'count': 5400, 'name': 'Fifty-Four Hundred', 'emoji': '🎪', 'description': 'Solved 5400 quizzes!'},
    {'count': 5600, 'name': 'Fifty-Six Hundred', 'emoji': '🎨', 'description': 'Solved 5600 quizzes!'},
    {'count': 5800, 'name': 'Fifty-Eight Hundred', 'emoji': '💫', 'description': 'Solved 5800 quizzes!'},
    {'count': 6000, 'name': 'Sextuple Millennium', 'emoji': '👑🔥💎⭐🌟⚡', 'description': 'Solved 6000 quizzes!'},
    {'count': 6200, 'name': 'Sixty-Two Hundred', 'emoji': '🎯', 'description': 'Solved 6200 quizzes!'},
    {'count': 6400, 'name': 'Sixty-Four Hundred', 'emoji': '🎪', 'description': 'Solved 6400 quizzes!'},
    {'count': 6600, 'name': 'Sixty-Six Hundred', 'emoji': '🎨', 'description': 'Solved 6600 quizzes!'},
    {'count': 6800, 'name': 'Sixty-Eight Hundred', 'emoji': '💫', 'description': 'Solved 6800 quizzes!'},
    {'count': 7000, 'name': 'Septuple Millennium', 'emoji': '👑🔥💎⭐🌟⚡🎭', 'description': 'Solved 7000 quizzes!'},
    {'count': 7200, 'name': 'Seventy-Two Hundred', 'emoji': '🎯', 'description': 'Solved 7200 quizzes!'},
    {'count': 7400, 'name': 'Seventy-Four Hundred', 'emoji': '🎪', 'description': 'Solved 7400 quizzes!'},
    {'count': 7600, 'name': 'Seventy-Six Hundred', 'emoji': '🎨', 'description': 'Solved 7600 quizzes!'},
    {'count': 7800, 'name': 'Seventy-Eight Hundred', 'emoji': '💫', 'description': 'Solved 7800 quizzes!'},
    {'count': 8000, 'name': 'Octuple Millennium', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯', 'description': 'Solved 8000 quizzes!'},
    {'count': 8200, 'name': 'Eighty-Two Hundred', 'emoji': '🎪', 'description': 'Solved 8200 quizzes!'},
    {'count': 8400, 'name': 'Eighty-Four Hundred', 'emoji': '🎨', 'description': 'Solved 8400 quizzes!'},
    {'count': 8600, 'name': 'Eighty-Six Hundred', 'emoji': '💫', 'description': 'Solved 8600 quizzes!'},
    {'count': 8800, 'name': 'Eighty-Eight Hundred', 'emoji': '🌟', 'description': 'Solved 8800 quizzes!'},
    {'count': 9000, 'name': 'Nonuple Millennium', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪', 'description': 'Solved 9000 quizzes!'},
    {'count': 9200, 'name': 'Ninety-Two Hundred', 'emoji': '🎨', 'description': 'Solved 9200 quizzes!'},
    {'count': 9400, 'name': 'Ninety-Four Hundred', 'emoji': '💫', 'description': 'Solved 9400 quizzes!'},
    {'count': 9600, 'name': 'Ninety-Six Hundred', 'emoji': '⭐', 'description': 'Solved 9600 quizzes!'},
    {'count': 9800, 'name': 'Ninety-Eight Hundred', 'emoji': '🔥', 'description': 'Solved 9800 quizzes!'},
    {'count': 10000, 'name': 'Decuple Millennium', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨', 'description': 'Solved 10000 quizzes!'},
    {'count': 10200, 'name': 'Ten-Two Hundred', 'emoji': '💫', 'description': 'Solved 10200 quizzes!'},
    {'count': 10400, 'name': 'Ten-Four Hundred', 'emoji': '⭐', 'description': 'Solved 10400 quizzes!'},
    {'count': 10600, 'name': 'Ten-Six Hundred', 'emoji': '🔥', 'description': 'Solved 10600 quizzes!'},
    {'count': 10800, 'name': 'Ten-Eight Hundred', 'emoji': '💎', 'description': 'Solved 10800 quizzes!'},
    {'count': 11000, 'name': 'Eleven Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫', 'description': 'Solved 11000 quizzes!'},
    {'count': 11200, 'name': 'Eleven-Two Hundred', 'emoji': '⭐', 'description': 'Solved 11200 quizzes!'},
    {'count': 11400, 'name': 'Eleven-Four Hundred', 'emoji': '🔥', 'description': 'Solved 11400 quizzes!'},
    {'count': 11600, 'name': 'Eleven-Six Hundred', 'emoji': '💎', 'description': 'Solved 11600 quizzes!'},
    {'count': 11800, 'name': 'Eleven-Eight Hundred', 'emoji': '🌟', 'description': 'Solved 11800 quizzes!'},
    {'count': 12000, 'name': 'Twelve Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐', 'description': 'Solved 12000 quizzes!'},
    {'count': 12200, 'name': 'Twelve-Two Hundred', 'emoji': '🔥', 'description': 'Solved 12200 quizzes!'},
    {'count': 12400, 'name': 'Twelve-Four Hundred', 'emoji': '💎', 'description': 'Solved 12400 quizzes!'},
    {'count': 12600, 'name': 'Twelve-Six Hundred', 'emoji': '🌟', 'description': 'Solved 12600 quizzes!'},
    {'count': 12800, 'name': 'Twelve-Eight Hundred', 'emoji': '⚡', 'description': 'Solved 12800 quizzes!'},
    {'count': 13000, 'name': 'Thirteen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐', 'description': 'Solved 13000 quizzes!'},
    {'count': 13200, 'name': 'Thirteen-Two Hundred', 'emoji': '🔥', 'description': 'Solved 13200 quizzes!'},
    {'count': 13400, 'name': 'Thirteen-Four Hundred', 'emoji': '💎', 'description': 'Solved 13400 quizzes!'},
    {'count': 13600, 'name': 'Thirteen-Six Hundred', 'emoji': '🌟', 'description': 'Solved 13600 quizzes!'},
    {'count': 13800, 'name': 'Thirteen-Eight Hundred', 'emoji': '⚡', 'description': 'Solved 13800 quizzes!'},
    {'count': 14000, 'name': 'Fourteen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥', 'description': 'Solved 14000 quizzes!'},
    {'count': 14200, 'name': 'Fourteen-Two Hundred', 'emoji': '💎', 'description': 'Solved 14200 quizzes!'},
    {'count': 14400, 'name': 'Fourteen-Four Hundred', 'emoji': '🌟', 'description': 'Solved 14400 quizzes!'},
    {'count': 14600, 'name': 'Fourteen-Six Hundred', 'emoji': '⚡', 'description': 'Solved 14600 quizzes!'},
    {'count': 14800, 'name': 'Fourteen-Eight Hundred', 'emoji': '🎭', 'description': 'Solved 14800 quizzes!'},
    {'count': 15000, 'name': 'Fifteen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎', 'description': 'Solved 15000 quizzes!'},
    {'count': 15200, 'name': 'Fifteen-Two Hundred', 'emoji': '🌟', 'description': 'Solved 15200 quizzes!'},
    {'count': 15400, 'name': 'Fifteen-Four Hundred', 'emoji': '⚡', 'description': 'Solved 15400 quizzes!'},
    {'count': 15600, 'name': 'Fifteen-Six Hundred', 'emoji': '🎭', 'description': 'Solved 15600 quizzes!'},
    {'count': 15800, 'name': 'Fifteen-Eight Hundred', 'emoji': '🎯', 'description': 'Solved 15800 quizzes!'},
    {'count': 16000, 'name': 'Sixteen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟', 'description': 'Solved 16000 quizzes!'},
    {'count': 16200, 'name': 'Sixteen-Two Hundred', 'emoji': '⚡', 'description': 'Solved 16200 quizzes!'},
    {'count': 16400, 'name': 'Sixteen-Four Hundred', 'emoji': '🎭', 'description': 'Solved 16400 quizzes!'},
    {'count': 16600, 'name': 'Sixteen-Six Hundred', 'emoji': '🎯', 'description': 'Solved 16600 quizzes!'},
    {'count': 16800, 'name': 'Sixteen-Eight Hundred', 'emoji': '🎪', 'description': 'Solved 16800 quizzes!'},
    {'count': 17000, 'name': 'Seventeen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡', 'description': 'Solved 17000 quizzes!'},
    {'count': 17200, 'name': 'Seventeen-Two Hundred', 'emoji': '🎭', 'description': 'Solved 17200 quizzes!'},
    {'count': 17400, 'name': 'Seventeen-Four Hundred', 'emoji': '🎯', 'description': 'Solved 17400 quizzes!'},
    {'count': 17600, 'name': 'Seventeen-Six Hundred', 'emoji': '🎪', 'description': 'Solved 17600 quizzes!'},
    {'count': 17800, 'name': 'Seventeen-Eight Hundred', 'emoji': '🎨', 'description': 'Solved 17800 quizzes!'},
    {'count': 18000, 'name': 'Eighteen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭', 'description': 'Solved 18000 quizzes!'},
    {'count': 18200, 'name': 'Eighteen-Two Hundred', 'emoji': '🎯', 'description': 'Solved 18200 quizzes!'},
    {'count': 18400, 'name': 'Eighteen-Four Hundred', 'emoji': '🎪', 'description': 'Solved 18400 quizzes!'},
    {'count': 18600, 'name': 'Eighteen-Six Hundred', 'emoji': '🎨', 'description': 'Solved 18600 quizzes!'},
    {'count': 18800, 'name': 'Eighteen-Eight Hundred', 'emoji': '💫', 'description': 'Solved 18800 quizzes!'},
    {'count': 19000, 'name': 'Nineteen Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯', 'description': 'Solved 19000 quizzes!'},
    {'count': 19200, 'name': 'Nineteen-Two Hundred', 'emoji': '🎪', 'description': 'Solved 19200 quizzes!'},
    {'count': 19400, 'name': 'Nineteen-Four Hundred', 'emoji': '🎨', 'description': 'Solved 19400 quizzes!'},
    {'count': 19600, 'name': 'Nineteen-Six Hundred', 'emoji': '💫', 'description': 'Solved 19600 quizzes!'},
    {'count': 19800, 'name': 'Nineteen-Eight Hundred', 'emoji': '⭐', 'description': 'Solved 19800 quizzes!'},
    {'count': 20000, 'name': 'Twenty Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯🎪', 'description': 'Solved 20000 quizzes!'},
    {'count': 20200, 'name': 'Twenty-Two Hundred', 'emoji': '🎨', 'description': 'Solved 20200 quizzes!'},
    {'count': 20400, 'name': 'Twenty-Four Hundred', 'emoji': '💫', 'description': 'Solved 20400 quizzes!'},
    {'count': 20600, 'name': 'Twenty-Six Hundred', 'emoji': '⭐', 'description': 'Solved 20600 quizzes!'},
    {'count': 20800, 'name': 'Twenty-Eight Hundred', 'emoji': '🔥', 'description': 'Solved 20800 quizzes!'},
    {'count': 21000, 'name': 'Twenty-One Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯🎪🎨', 'description': 'Solved 21000 quizzes!'},
    {'count': 21200, 'name': 'Twenty-One-Two Hundred', 'emoji': '💫', 'description': 'Solved 21200 quizzes!'},
    {'count': 21400, 'name': 'Twenty-One-Four Hundred', 'emoji': '⭐', 'description': 'Solved 21400 quizzes!'},
    {'count': 21600, 'name': 'Twenty-One-Six Hundred', 'emoji': '🔥', 'description': 'Solved 21600 quizzes!'},
    {'count': 21800, 'name': 'Twenty-One-Eight Hundred', 'emoji': '💎', 'description': 'Solved 21800 quizzes!'},
    {'count': 22000, 'name': 'Twenty-Two Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯🎪🎨💫', 'description': 'Solved 22000 quizzes!'},
    {'count': 22200, 'name': 'Twenty-Two-Two Hundred', 'emoji': '⭐', 'description': 'Solved 22200 quizzes!'},
    {'count': 22400, 'name': 'Twenty-Two-Four Hundred', 'emoji': '🔥', 'description': 'Solved 22400 quizzes!'},
    {'count': 22600, 'name': 'Twenty-Two-Six Hundred', 'emoji': '💎', 'description': 'Solved 22600 quizzes!'},
    {'count': 22800, 'name': 'Twenty-Two-Eight Hundred', 'emoji': '🌟', 'description': 'Solved 22800 quizzes!'},
    {'count': 23000, 'name': 'Twenty-Three Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯🎪🎨💫⭐', 'description': 'Solved 23000 quizzes!'},
    {'count': 23200, 'name': 'Twenty-Three-Two Hundred', 'emoji': '🔥', 'description': 'Solved 23200 quizzes!'},
    {'count': 23400, 'name': 'Twenty-Three-Four Hundred', 'emoji': '💎', 'description': 'Solved 23400 quizzes!'},
    {'count': 23600, 'name': 'Twenty-Three-Six Hundred', 'emoji': '🌟', 'description': 'Solved 23600 quizzes!'},
    {'count': 23800, 'name': 'Twenty-Three-Eight Hundred', 'emoji': '⚡', 'description': 'Solved 23800 quizzes!'},
    {'count': 24000, 'name': 'Twenty-Four Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯🎪🎨💫⭐⭐', 'description': 'Solved 24000 quizzes!'},
    {'count': 24200, 'name': 'Twenty-Four-Two Hundred', 'emoji': '🔥', 'description': 'Solved 24200 quizzes!'},
    {'count': 24400, 'name': 'Twenty-Four-Four Hundred', 'emoji': '💎', 'description': 'Solved 24400 quizzes!'},
    {'count': 24600, 'name': 'Twenty-Four-Six Hundred', 'emoji': '🌟', 'description': 'Solved 24600 quizzes!'},
    {'count': 24800, 'name': 'Twenty-Four-Eight Hundred', 'emoji': '⚡', 'description': 'Solved 24800 quizzes!'},
    {'count': 25000, 'name': 'Twenty-Five Thousand', 'emoji': '👑🔥💎⭐🌟⚡🎭🎯🎪🎨💫⭐⭐🔥💎🌟⚡🎭🎯🎪🎨💫⭐⭐🔥', 'description': 'Solved 25000 quizzes!'},
  ];

  // Get list of milestone counts
  static List<int> get milestoneCounts {
    return allMilestones.map((milestone) => milestone['count'] as int).toList();
  }

  // Get earned badges for a given quiz count
  static List<Map<String, dynamic>> getEarnedBadges(int totalQuizzes) {
    final List<Map<String, dynamic>> badges = [];
    
    for (final milestone in allMilestones) {
      if (totalQuizzes >= milestone['count']!) {
        badges.add({
          'badgeName': milestone['name']!,
          'badgeImage': milestone['emoji']!,
          'milestone': milestone['count']!,
          'description': milestone['description']!,
        });
      }
    }

    return badges;
  }

  // Get next milestone
  static int? getNextMilestone(int totalQuizzes) {
    for (final milestone in milestoneCounts) {
      if (totalQuizzes < milestone) {
        return milestone;
      }
    }
    return null;
  }

  // Get badge name for milestone
  static String getBadgeNameForMilestone(int milestone) {
    final badge = allMilestones.firstWhere(
      (badge) => badge['count'] == milestone,
      orElse: () => {'name': 'Quiz Achiever'},
    );
    return badge['name'] as String;
  }

  // Get badge emoji for milestone
  static String getBadgeEmojiForMilestone(int milestone) {
    final badge = allMilestones.firstWhere(
      (badge) => badge['count'] == milestone,
      orElse: () => {'emoji': '🏅'},
    );
    return badge['emoji'] as String;
  }

  // Get badge description for milestone
  static String getBadgeDescriptionForMilestone(int milestone) {
    final badge = allMilestones.firstWhere(
      (badge) => badge['count'] == milestone,
      orElse: () => {'description': 'Achievement unlocked!'},
    );
    return badge['description'] as String;
  }
} 