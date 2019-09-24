// import '../utils/hot-reload'
import Vue from "vue";
import AppComponent from "./App/App.vue";
import {name} from '../manifest.development'
Vue.component("app-component", AppComponent);

new Vue({
    el: "#app",
    render: createElement => {
        return createElement(AppComponent);
    }
});
chrome.devtools.panels.create(
    name,
    "logo.png",
    "pannel.html",
    function(panel) {
      console.log("Content is loaded to panel");
    }
);


