---
layout: post
title: "实现kilo.c中的思考"
description: "实现kilo.c中的思考"
category: 
tags: []
---

# 实现kilo.c中的思考

有些数据就是规定好的，这个就叫API

比较termios这个struct，里面的定义和起效方式，就是如此的规定。

还有CNTL_KEY的define定义，把相关的ctrl+char，转成相应值，也是一种约定，ASCII定义。

这里想到了《UNIX环境高级编程》的作用，它是在整体上给出了UNIX API的接口实现以及细节实现

