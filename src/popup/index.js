import Vue from "vue";
import AppComponent from "./App/App.vue";

Vue.component("app-component", AppComponent);
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)
import {
  Card,
  Button,
  Link,
    Loading,
    Tooltip
  // Message
} from 'element-ui';
Vue.use(Link)
Vue.use(Card);
Vue.use(Button);
Vue.use(Loading);
Vue.use(Tooltip);
// Vue.use(Message);

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(AppComponent);
  }
});
