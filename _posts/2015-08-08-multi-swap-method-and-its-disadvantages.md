---
layout: post
title: "各种不同的swap方法和他们的优缺点"
description: ""
category: 
tags: []
---

# 各种不同的swap方法和他们的优缺点
# Multi-swap method and its Pros and Cons

Method 1: 

* Pros: Easy to read and write
* Cons: need an extra space 

```c
void swap(int &a, int &b) {
  int temp = a;
  a = b;
  b = temp;
}
```

Method 2: 

* Pros: No more extra space needed
* Cons: Add an if-statement to check a, b is not in the same address
Otherwise a,b will all set to 0.

```c
void swap(int &a, int &b) {
  if (&a == &b)
    return;
  a = a^b;
  b = a^b;
  a = a^b;
}
```

Method 3:

* *Pros: No more extra space
* Cons: maybe overflow

```c
void swap(int &a, int &b) {
  x = x + y;
  y = x - y;
  x = x - y;
}
```

Conclusion:
Method 1 is enough. and It doesn't need to write Method 2 and Method 3 for saving one extra space
Besides, compilers will optimize the process too.

> We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil

By: Donald Knuth

About sentences above:
I think we should divide the work into what we should do to optimize, 
and what we could distribute to the tools like compilers, OS, etc.

And Optimization is one mandatory process of software cycling.
