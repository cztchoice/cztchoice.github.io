---
layout: page
title: Home Page
tagline: You can find my posts here
---
{% include JB/setup %}


<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
    <div class="content">
        {{ post.content }}
    </div>

  {% endfor %}
</ul>

