<template>
  <section class="page-hero">
    <div class="page-hero-bg">
      <img :src="bgImage" :alt="breadcrumbTitle" />
      <div class="page-hero-overlay"></div>
    </div>
    <div class="container page-hero-content">
      <div class="breadcrumb-nav">
        <router-link to="/">Home</router-link><span>/</span><span>{{ breadcrumbTitle }}</span>
      </div>
      <h1>
        {{ title }}
        <span class="tg" v-if="accentTitle">{{ accentTitle }}</span>
      </h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  bgImage: {
    type: String,
    required: true
  },
  breadcrumbTitle: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  accentTitle: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>
