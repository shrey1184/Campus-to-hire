from app.database import SessionLocal
from app.models import Resource


def problem(
    title: str,
    slug: str,
    topic: str,
    difficulty: str,
    sub_topic: str,
    estimated_minutes: int,
    tags: list[str],
    youtube_url: str | None = None,
):
    return {
        "title": title,
        "topic": topic,
        "sub_topic": sub_topic,
        "difficulty": difficulty,
        "resource_type": "leetcode",
        "url": f"https://leetcode.com/problems/{slug}/",
        "youtube_url": youtube_url,
        "platform": "leetcode",
        "estimated_minutes": estimated_minutes,
        "tags": tags,
    }


def resource(
    title: str,
    topic: str,
    difficulty: str,
    resource_type: str,
    url: str,
    platform: str,
    sub_topic: str = "",
    estimated_minutes: int | None = None,
    tags: list[str] | None = None,
    youtube_url: str | None = None,
):
    return {
        "title": title,
        "topic": topic,
        "sub_topic": sub_topic or None,
        "difficulty": difficulty,
        "resource_type": resource_type,
        "url": url,
        "youtube_url": youtube_url,
        "platform": platform,
        "estimated_minutes": estimated_minutes,
        "tags": tags or [],
    }


def build_resources():
    resources = [
        problem("Two Sum", "two-sum", "Arrays", "easy", "Hash Map", 25, ["array", "hash-map"]),
        problem("Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "Arrays", "easy", "Sliding Window", 25, ["array", "greedy"]),
        problem("Contains Duplicate", "contains-duplicate", "Arrays", "easy", "Hash Set", 15, ["array", "set"]),
        problem("Product of Array Except Self", "product-of-array-except-self", "Arrays", "medium", "Prefix/Suffix", 35, ["array", "prefix"]),
        problem("Maximum Subarray", "maximum-subarray", "Arrays", "medium", "Kadane", 30, ["array", "greedy"]),
        problem("Merge Intervals", "merge-intervals", "Arrays", "medium", "Intervals", 35, ["intervals", "sorting"]),
        problem("3Sum", "3sum", "Arrays", "medium", "Two Pointers", 40, ["array", "two-pointers"]),
        problem("Container With Most Water", "container-with-most-water", "Arrays", "medium", "Two Pointers", 30, ["array", "two-pointers"]),
        problem("Longest Consecutive Sequence", "longest-consecutive-sequence", "Arrays", "medium", "Hash Set", 35, ["array", "hash-set"]),
        problem("Trapping Rain Water", "trapping-rain-water", "Arrays", "hard", "Two Pointers", 50, ["array", "two-pointers"]),

        problem("Valid Anagram", "valid-anagram", "Strings", "easy", "Frequency Count", 15, ["string", "hash-map"]),
        problem("Group Anagrams", "group-anagrams", "Strings", "medium", "Hashing", 30, ["string", "hash-map"]),
        problem("Longest Substring Without Repeating Characters", "longest-substring-without-repeating-characters", "Strings", "medium", "Sliding Window", 35, ["string", "sliding-window"]),
        problem("Valid Palindrome", "valid-palindrome", "Strings", "easy", "Two Pointers", 15, ["string", "two-pointers"]),
        problem("Longest Palindromic Substring", "longest-palindromic-substring", "Strings", "medium", "Expand Around Center", 35, ["string"]),
        problem("Palindromic Substrings", "palindromic-substrings", "Strings", "medium", "Expand Around Center", 30, ["string"]),
        problem("Minimum Window Substring", "minimum-window-substring", "Strings", "hard", "Sliding Window", 50, ["string", "sliding-window"]),
        problem("Find All Anagrams in a String", "find-all-anagrams-in-a-string", "Strings", "medium", "Sliding Window", 35, ["string", "sliding-window"]),

        problem("Reverse Linked List", "reverse-linked-list", "Linked List", "easy", "Pointers", 20, ["linked-list"]),
        problem("Merge Two Sorted Lists", "merge-two-sorted-lists", "Linked List", "easy", "Pointers", 20, ["linked-list"]),
        problem("Linked List Cycle", "linked-list-cycle", "Linked List", "easy", "Fast/Slow Pointers", 20, ["linked-list", "two-pointers"]),
        problem("Reorder List", "reorder-list", "Linked List", "medium", "Fast/Slow Pointers", 35, ["linked-list"]),
        problem("Remove Nth Node From End of List", "remove-nth-node-from-end-of-list", "Linked List", "medium", "Two Pointers", 25, ["linked-list", "two-pointers"]),
        problem("Add Two Numbers", "add-two-numbers", "Linked List", "medium", "Simulation", 30, ["linked-list"]),
        problem("Copy List with Random Pointer", "copy-list-with-random-pointer", "Linked List", "medium", "Hash Map", 40, ["linked-list", "hash-map"]),

        problem("Valid Parentheses", "valid-parentheses", "Stacks & Queues", "easy", "Stack", 15, ["stack"]),
        problem("Min Stack", "min-stack", "Stacks & Queues", "medium", "Stack", 25, ["stack", "design"]),
        problem("Evaluate Reverse Polish Notation", "evaluate-reverse-polish-notation", "Stacks & Queues", "medium", "Stack", 25, ["stack"]),
        problem("Daily Temperatures", "daily-temperatures", "Stacks & Queues", "medium", "Monotonic Stack", 35, ["stack", "monotonic"]),
        problem("Car Fleet", "car-fleet", "Stacks & Queues", "medium", "Stack", 30, ["stack", "sorting"]),
        problem("Largest Rectangle in Histogram", "largest-rectangle-in-histogram", "Stacks & Queues", "hard", "Monotonic Stack", 50, ["stack", "monotonic"]),

        problem("Invert Binary Tree", "invert-binary-tree", "Binary Trees", "easy", "DFS", 15, ["tree", "dfs"]),
        problem("Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "Binary Trees", "easy", "DFS", 15, ["tree", "dfs"]),
        problem("Diameter of Binary Tree", "diameter-of-binary-tree", "Binary Trees", "easy", "DFS", 25, ["tree", "dfs"]),
        problem("Balanced Binary Tree", "balanced-binary-tree", "Binary Trees", "easy", "DFS", 20, ["tree", "dfs"]),
        problem("Same Tree", "same-tree", "Binary Trees", "easy", "DFS", 15, ["tree"]),
        problem("Subtree of Another Tree", "subtree-of-another-tree", "Binary Trees", "easy", "DFS", 25, ["tree"]),
        problem("Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "Binary Trees", "medium", "BFS", 25, ["tree", "bfs"]),
        problem("Binary Tree Right Side View", "binary-tree-right-side-view", "Binary Trees", "medium", "BFS", 25, ["tree", "bfs"]),
        problem("Lowest Common Ancestor of a Binary Tree", "lowest-common-ancestor-of-a-binary-tree", "Binary Trees", "medium", "DFS", 35, ["tree", "dfs"]),

        problem("Validate Binary Search Tree", "validate-binary-search-tree", "BST", "medium", "Inorder", 30, ["bst", "tree"]),
        problem("Kth Smallest Element in a BST", "kth-smallest-element-in-a-bst", "BST", "medium", "Inorder", 30, ["bst", "tree"]),
        problem("Lowest Common Ancestor of a Binary Search Tree", "lowest-common-ancestor-of-a-binary-search-tree", "BST", "medium", "BST", 20, ["bst", "tree"]),
        problem("Convert Sorted Array to Binary Search Tree", "convert-sorted-array-to-binary-search-tree", "BST", "easy", "Divide and Conquer", 20, ["bst", "tree"]),

        problem("Number of Islands", "number-of-islands", "Graphs", "medium", "BFS/DFS", 35, ["graph", "bfs", "dfs"]),
        problem("Clone Graph", "clone-graph", "Graphs", "medium", "Graph Traversal", 35, ["graph", "dfs"]),
        problem("Max Area of Island", "max-area-of-island", "Graphs", "medium", "DFS", 30, ["graph", "dfs"]),
        problem("Pacific Atlantic Water Flow", "pacific-atlantic-water-flow", "Graphs", "medium", "DFS", 40, ["graph", "dfs"]),
        problem("Course Schedule", "course-schedule", "Graphs", "medium", "Topological Sort", 40, ["graph", "topological-sort"]),
        problem("Rotting Oranges", "rotting-oranges", "Graphs", "medium", "BFS", 25, ["graph", "bfs"]),
        problem("Surrounded Regions", "surrounded-regions", "Graphs", "medium", "DFS", 35, ["graph", "dfs"]),
        problem("Word Ladder", "word-ladder", "Graphs", "hard", "BFS", 55, ["graph", "bfs"]),

        problem("Climbing Stairs", "climbing-stairs", "Dynamic Programming", "easy", "1D DP", 20, ["dp"]),
        problem("Min Cost Climbing Stairs", "min-cost-climbing-stairs", "Dynamic Programming", "easy", "1D DP", 25, ["dp"]),
        problem("House Robber", "house-robber", "Dynamic Programming", "medium", "1D DP", 30, ["dp"]),
        problem("House Robber II", "house-robber-ii", "Dynamic Programming", "medium", "1D DP", 35, ["dp"]),
        problem("Longest Increasing Subsequence", "longest-increasing-subsequence", "Dynamic Programming", "medium", "Sequence DP", 40, ["dp"]),
        problem("Coin Change", "coin-change", "Dynamic Programming", "medium", "Unbounded Knapsack", 35, ["dp"]),
        problem("Longest Common Subsequence", "longest-common-subsequence", "Dynamic Programming", "medium", "2D DP", 40, ["dp"]),
        problem("Word Break", "word-break", "Dynamic Programming", "medium", "1D DP", 35, ["dp"]),
        problem("Combination Sum IV", "combination-sum-iv", "Dynamic Programming", "medium", "1D DP", 35, ["dp"]),
        problem("Decode Ways", "decode-ways", "Dynamic Programming", "medium", "1D DP", 35, ["dp"]),

        problem("Jump Game", "jump-game", "Greedy", "medium", "Greedy", 25, ["greedy"]),
        problem("Jump Game II", "jump-game-ii", "Greedy", "medium", "Greedy", 30, ["greedy"]),
        problem("Gas Station", "gas-station", "Greedy", "medium", "Greedy", 30, ["greedy"]),
        problem("Partition Labels", "partition-labels", "Greedy", "medium", "Greedy", 25, ["greedy"]),
        problem("Hand of Straights", "hand-of-straights", "Greedy", "medium", "Greedy", 35, ["greedy"]),

        problem("Subsets", "subsets", "Backtracking", "medium", "Recursion", 25, ["backtracking"]),
        problem("Combination Sum", "combination-sum", "Backtracking", "medium", "Recursion", 30, ["backtracking"]),
        problem("Permutations", "permutations", "Backtracking", "medium", "Recursion", 30, ["backtracking"]),
        problem("Word Search", "word-search", "Backtracking", "medium", "Grid DFS", 35, ["backtracking", "dfs"]),
        problem("N-Queens", "n-queens", "Backtracking", "hard", "Recursion", 55, ["backtracking"]),

        problem("Binary Search", "binary-search", "Binary Search", "easy", "Binary Search", 15, ["binary-search"]),
        problem("Search a 2D Matrix", "search-a-2d-matrix", "Binary Search", "medium", "Binary Search", 25, ["binary-search"]),
        problem("Koko Eating Bananas", "koko-eating-bananas", "Binary Search", "medium", "Binary Search on Answer", 35, ["binary-search"]),
        problem("Find Minimum in Rotated Sorted Array", "find-minimum-in-rotated-sorted-array", "Binary Search", "medium", "Binary Search", 25, ["binary-search"]),
        problem("Search in Rotated Sorted Array", "search-in-rotated-sorted-array", "Binary Search", "medium", "Binary Search", 30, ["binary-search"]),

        problem("Kth Largest Element in an Array", "kth-largest-element-in-an-array", "Heap", "medium", "Heap", 30, ["heap"]),
        problem("Top K Frequent Elements", "top-k-frequent-elements", "Heap", "medium", "Heap", 30, ["heap"]),
        problem("Find Median from Data Stream", "find-median-from-data-stream", "Heap", "hard", "Two Heaps", 50, ["heap"]),
        problem("Merge k Sorted Lists", "merge-k-sorted-lists", "Heap", "hard", "Heap", 50, ["heap", "linked-list"]),

        resource("Striver A2Z DSA Course", "Arrays", "medium", "article", "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", "takeuforward", "Structured DSA", 180, ["dsa", "sheet"]),
        resource("NeetCode Roadmap", "Arrays", "medium", "article", "https://neetcode.io/roadmap", "neetcode", "Structured DSA", 180, ["dsa", "roadmap"]),
        resource("NeetCode Channel", "Dynamic Programming", "medium", "youtube", "https://www.youtube.com/@NeetCode", "youtube", "Interview Prep", 90, ["youtube", "dsa"]),
        resource("takeUforward Channel", "Dynamic Programming", "medium", "youtube", "https://www.youtube.com/@takeUforward", "youtube", "Interview Prep", 90, ["youtube", "dsa"]),
        resource("CodeWithHarry Channel", "Projects", "easy", "youtube", "https://www.youtube.com/@CodeWithHarry", "codewithharry", "Hindi Prep", 90, ["hindi", "programming"]),
        resource("Apna College Channel", "Projects", "easy", "youtube", "https://www.youtube.com/@ApnaCollegeOfficial", "apna college", "Hindi Prep", 90, ["hindi", "programming"]),
        resource("Gate Smashers DBMS", "DBMS", "medium", "youtube", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y", "youtube", "DBMS", 240, ["dbms"]),
        resource("Gate Smashers Operating Systems", "Operating Systems", "medium", "youtube", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", "youtube", "OS", 240, ["os"]),
        resource("GFG DBMS Tutorial", "DBMS", "easy", "article", "https://www.geeksforgeeks.org/dbms/", "geeksforgeeks", "DBMS", 120, ["dbms"]),
        resource("GFG Operating Systems", "Operating Systems", "easy", "article", "https://www.geeksforgeeks.org/operating-systems/", "geeksforgeeks", "OS", 120, ["os"]),
        resource("GFG Computer Networks", "Computer Networks", "easy", "article", "https://www.geeksforgeeks.org/computer-network-tutorials/", "geeksforgeeks", "CN", 120, ["networking"]),
        resource("IndiaBIX Aptitude", "Aptitude", "easy", "practice", "https://www.indiabix.com/", "indiabix", "Aptitude", 90, ["aptitude"]),
        resource("PrepInsta Company Preparation", "Aptitude", "medium", "article", "https://prepinsta.com/", "prepinsta", "Placement Prep", 90, ["placement"]),
        resource("Frontend Mentor Challenges", "Projects", "easy", "practice", "https://www.frontendmentor.io/challenges", "frontendmentor", "Projects", 120, ["project", "frontend"]),
        resource("GitHub Beginner Projects", "Projects", "easy", "article", "https://github.com/topics/beginner-project", "github", "Projects", 120, ["project"]),
        resource("Roadmap.sh Computer Science", "OOP", "easy", "article", "https://roadmap.sh/computer-science", "roadmap.sh", "CS Roadmap", 120, ["roadmap"]),
        resource("Roadmap.sh Backend", "SQL", "easy", "article", "https://roadmap.sh/backend", "roadmap.sh", "Backend", 120, ["backend"]),
        resource("Roadmap.sh Frontend", "Projects", "easy", "article", "https://roadmap.sh/frontend", "roadmap.sh", "Frontend", 120, ["frontend"]),
        resource("HackerRank Interview Prep", "Aptitude", "medium", "practice", "https://www.hackerrank.com/domains", "hackerrank", "Interview Prep", 90, ["coding-test"]),
        resource("CodeChef Practice", "Aptitude", "medium", "practice", "https://www.codechef.com/practice", "codechef", "Interview Prep", 90, ["coding-test"]),
    ]

    return resources


def upsert_resources():
    db = SessionLocal()
    try:
        seeded = 0
        updated = 0
        for item in build_resources():
            existing = db.query(Resource).filter(Resource.url == item["url"]).first()
            if existing:
                for key, value in item.items():
                    setattr(existing, key, value)
                updated += 1
            else:
                db.add(Resource(**item))
                seeded += 1

        db.commit()
        print(f"Resource seed complete. inserted={seeded} updated={updated}")
    finally:
        db.close()


if __name__ == "__main__":
    upsert_resources()
