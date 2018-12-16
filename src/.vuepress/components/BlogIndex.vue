<template>
  <div>
    <article v-for="post in posts">
      <h2>
        <router-link :to="post.path">{{ post.title }}</router-link>
      </h2>
      <span class="post-date">📅 {{ post.frontmatter.date}}</span>
      <p v-html="post.frontmatter.description || '&hellip;'"></p>
    </article>
  </div>
</template>

<script>
export default {
  computed: {
    posts() {
      return this.$site.pages
        .filter(x => x.frontmatter.type == 'post')
        .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
    }
  }
}
</script>

<style>
.post-date {
  color: #333;
}
</style>
