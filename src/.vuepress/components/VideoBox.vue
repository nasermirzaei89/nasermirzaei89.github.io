<template>
  <div class="videoWrapper">
    <iframe
      :width="width"
      :height="height"
      :src="src"
      :frameborder="frameborder"
      :allow="allow"
      :allowfullscreen="allowfullscreen"
    ></iframe>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    },
    allowfullscreen: {
      type: Boolean,
      default: true
    },
    allow: {
      type: String,
      default: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    },
    frameborder: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.videoWrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  height: 0;
}
.videoWrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
