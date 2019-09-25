import '../utils/hot-reload'
import Vue from "vue";
import AppComponent from "./App/App.vue";
// import router from './router'
// import VueCodemirror from 'vue-codemirror'
// import 'codemirror/lib/codemirror.css'
// import 'codemirror/mode/javascript/javascript'
// import 'codemirror/mode/htmlmixed/htmlmixed'
// Vue.use(VueCodemirror)
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)
import {Button,Alert,Tabs,TabPane,
  Checkbox,Table,TableColumn,Image,Loading,
  Tooltip,Message,Input,InputNumber,Link,Dialog,
  Notification} from 'element-ui'
// Vue.component(Button.name,Button)
// Vue.component(Alert.name,Alert)
// Vue.component(Tabs.name,Tabs)
// Vue.component(TabPane.name,TabPane)
// Vue.component(Checkbox.name,Checkbox)
// Vue.component(Table.name,Table)
// Vue.component(TableColumn.name,TableColumn)
// Vue.component(Image.name,Image)
// Vue.component(Tooltip.name,Tooltip)
// Vue.component(Input.name,Input)
// Vue.component(InputNumber.name,InputNumber)
// Vue.component(Link.name,Link)
Vue.use(Button)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Checkbox)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Image)
Vue.use(Loading)
Vue.use(Tooltip)
Vue.use(Input)
Vue.use(Tooltip)
Vue.use(InputNumber)
Vue.use(Link)
Vue.use(Dialog)
// Vue.use(Notification)
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
Vue.component("app-component", AppComponent);

new Vue({
  el: "#app",
  // router,
  render: createElement => {
    return createElement(AppComponent);
  }
});
