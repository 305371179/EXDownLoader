<template>
    <div
    >
      <span class="title">{{name}}</span>
      <a :href="homepage_url">看源码</a>
    </div>
</template>

<script>
  import {name , homepage_url} from '../../manifest.development'
  console.log('官网地址：'+homepage_url)
export default {
  name: 'app',
  data(){
    return {
      name,
      homepage_url
    }
  }
}
</script>

<style>
.main_app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
