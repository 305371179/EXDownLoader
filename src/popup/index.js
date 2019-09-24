import Vue from "vue";
import AppComponent from "./App/App.vue";

Vue.component("app-component", AppComponent);

import {
  Card,
  Button,
  Link
} from 'element-ui';
Vue.use(Link)
Vue.use(Card);
Vue.use(Button);

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(AppComponent);
  }
});
