---
layout: post
title: "c struct initial"
description: ""
category: 
tags: []
---

最近在阅读Linux内核中大量使用的struct指定初始化方式，以前没有见过，所以调研了一下，下面是调研的总结。

首先说下C struct初始化的方式：

有两种：

1. C89风格初始化方式
2. 指定初始化(designated initializers), C99添加，只可以在C语言中使用，不可以在C++中使用

>指定初始化(designated initializers)的优势：

> * Elements within an aggregate can be initialized in any order.
> * The initializer list can omit elements that are declared anywhere in the aggregate, rather than only at the end. Elements that are omitted are initialized as if they are static objects: arithmetic types are initialized to 0; pointers are initialized to NULL.
> * Where inconsistent or incomplete bracketing of initializers for multi-dimensional arrays or nested aggregates may be difficult to understand, designators can more clearly identify the element or member to be initialized.

* 集合体（结构，联合，数组）中的元素可以以任何顺序初始化
* 初始化程序可以忽略在集合体的任何位置上声明的元素，而不是象在C89的初始化方式中只能忽略最后的几个元素。 **被忽略的元素会以静态对象的方式进行初始化：数值类型被初始化为0， 指针被初始化为NULL** 
* 一般的初始化(C89)方式下，多维数组和嵌套集合中一些不一致和未完成的括号，可能会使得代码难以理解，指定初始化则可以更清晰的分辨出要被初始化的元素和成员。

**所以推荐大家用指定初始化**

下面是各种初始化方式的例子：

~~~ C
test t_designated_initializer = {
    //Designated initializers， not in order
    .b = 3,
    .a = 4
};

test t_partial_designated_initializer = {
    .b = 3      //it can be 
};

test t_c89_initializer = {
3, 4};
~~~

参考[Initialization of structures and unions]，[Designated initializers for aggregate types (C only)], [C99 new feature: 指定初始化][C99 Designated initializers in Chinese]

不过我们很多情况下是不赋初值的，那么在这种情况下，不同的赋值方式有什么样的结果呢？

未初始化情况下的默认参数：

>the initial value of uninitialized structure members depends on the **storage class** associated with the structure or union variable. In a structure declared as static, any members that are not initialized are implicitly initialized to zero of the appropriate type; the members of a structure with automatic storage have no default initialization. 

翻译如下：
未初始化的结构成员的初值，是由结构(struct)或者联合(union)变量的**存储类型(storage class)**决定的。在一个被声明为静态类型(static)的结构里，任何未被初始化的成员都被隐式的初始化为相应类型的零值；而在自动（automaic）存储类型的结构里，则没有任何的默认初始化值。

参考：[Initialization of structures and unions]

那么什么是存储类型(storage class)呢？

C has a concept of 'Storage classes' which are used to define the scope (visability) and life time of variables and/or functions

C有一个“存储类型”的概念，这个概念被用来定义变量或者函数的作用域（可见性）和生命周期。

1. auto is the default storage class for local variables
2. register is used to define local variables that should be stored in a register instead of RAM
3. static is the default storage class for global variables
4. extern defines a global variable that is visable to ALL object modules. When you use 'extern' the variable cannot be initalized as all it does is point the variable name at a storage location that has been previously defined

参考：[C Storage Classes], [C语言的5种存储类以及关键字volatile、restrict][C five storage Class]

验证程序如下：

~~~ C
#include<stdio.h>
#include<stdlib.h>

typedef struct test{
    int a;
	int b;
}test;

test t_designated_initializer = {
    //Designated initializers
    //the advantage of Designated initializers is that the element of it can be assigned in any order
    //like this:
    .b = 3,
	.a = 4
};

//
test t_partial_designated_initializer = {
    .b = 3      //it can be 
};


test t_c89_initializer = {
3, 4};

//Test the default initializers in the global scope
int memory_disturb_1 = 3;
static test t_default_global_static = {
    .a = 3
};
int memory_disturb_2 = 3;
test t_default_global_non_static = {
    .a = 3
};
int memory_disturb_3 = 3;

void print_info(struct test t, const char *desc)
{
	printf("%s.a: %d\n", desc, t.a);
	printf("%s.b: %d\n", desc, t.b);
	printf("\n");
}

int main()
{
    //Test the default initializers in a local scope
    //static store 
    int memory_disturb_4 = 3;
    static test t_default_local_static_designated_partial = {
        .a = 3
    };
    int memory_disturb_5 = 3;
    test t_default_local_non_static_designated_partial = {
        .a = 3
    };
    int memory_disturb_10 = 3;
    static test t_default_local_static_c89_partial = {
        3
    };
    int memory_disturb_6 = 3;
    test t_default_local_non_static_c89_partial = {
        3
    };
    int memory_disturb_7 = 3;
    static test t_default_local_static;
    int memory_disturb_8 = 3;
    test t_default_local_non_static;
    int memory_disturb_9 = 3;
	
	print_info(t_c89_initializer,                              "t_c89_initializer");
	print_info(t_designated_initializer,                       "t_designated_initializer");
	
	print_info(t_default_global_static,                        "t_default_global_static");
	print_info(t_default_global_non_static,                    "t_default_global_non_static");
	
	print_info(t_default_local_static_designated_partial,      "t_default_local_static_designated_partial");
	print_info(t_default_local_non_static_designated_partial,  "t_default_local_non_static_designated_partial");
	
	print_info(t_default_local_static_c89_partial,             "t_default_local_static_c89_partial");
	print_info(t_default_local_non_static_c89_partial,         "t_default_local_non_static_c89_partial");
	
    print_info(t_default_local_static,                         "t_default_local_static");
    print_info(t_default_local_non_static,                     "t_default_local_non_static");

	return 0;
}
~~~

输出结果为：

~~~
t_c89_initializer.a: 3
t_c89_initializer.b: 4

t_designated_initializer.a: 4
t_designated_initializer.b: 3

t_default_global_static.a: 3
t_default_global_static.b: 0

t_default_global_non_static.a: 3
t_default_global_non_static.b: 0

t_default_local_static_designated_partial.a: 3
t_default_local_static_designated_partial.b: 0

t_default_local_non_static_designated_partial.a
t_default_local_non_static_designated_partial.b

t_default_local_static_c89_partial.a: 3
t_default_local_static_c89_partial.b: 0

t_default_local_non_static_c89_partial.a: 3
t_default_local_non_static_c89_partial.b: 0

t_default_local_static.a: 0
t_default_local_static.b: 0

t_default_local_non_static.a: 2686916
t_default_local_non_static.b: 1963560149
~~~

可以看到最后的local_non_static被初始化成了一个无意义的值。其他的都可以正常的初始化成功。

[Initialization of structures and unions]:https://publib.boulder.ibm.com/infocenter/comphelp/v8v101/index.jsp?topic=%2Fcom.ibm.xlcpp8a.doc%2Flanguage%2Fref%2Fstrin.htm
[C Storage Classes]:http://www.lix.polytechnique.fr/~liberti/public/computing/prog/c/C/CONCEPT/storage_class.html
[Designated initializers for aggregate types (C only)]:https://publib.boulder.ibm.com/infocenter/comphelp/v8v101/index.jsp?topic=%2Fcom.ibm.xlcpp8a.doc%2Flanguage%2Fref%2Fdesignators.htm
[Are members of a C++ struct initialized to 0 by default?]:http://stackoverflow.com/questions/1069621/are-members-of-a-c-struct-initialized-to-0-by-default
[Default values in a C Struct]:http://stackoverflow.com/questions/749180/default-values-in-a-c-struct
[C five storage Class]:http://www.blogjava.net/killme2008/archive/2007/08/04/134399.html
[C99 Designated initializers in Chinese]:https://blogs.oracle.com/weixue/entry/c99_new_feature_%E6%8C%87%E5%AE%9A%E5%88%9D%E5%A7%8B%E5%8C%96_designated


