---
layout: post
title: "各种不同的swap方法和他们的优缺点"
description: ""
category: 
tags: []
---

# 各种不同的swap方法和他们的优缺点
# Multi-swap method and its Pros and Cons

Origin:
Today I write a quicksort program. I'm very confident, and think I can write once and get it through.
But reality is different, I debug it for 1 and a half hour. And find the question is on the swap function I used.

First, I use a swap funciton like this:

```c
void swap(int &a, int &b) {
  a = a^b;
  b = a^b;
  a = a^b;
}
```

And get many output of 0, which I didn't even have one in the input array.
Then I try this one:

```c
void swap(int &a, int &b) {
  int temp = a;
  b = temp;
  a = b;
}
```

Yeah, I make a mistake that, the third sentence should be the second sentence.

But, the two mistakes is not easy to find, especially when I'm not very confident with my quicksort code.
and confident with my swap code. What a crazy thing.

So, I decide to collect some swap method, and compare below.

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
