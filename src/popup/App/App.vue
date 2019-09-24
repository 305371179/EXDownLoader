<template>
    <el-card class="box-card">
        <div
                slot="header"
                class="clearfix"
        >
            <span class="title">{{name}}</span>
            <el-link type="success" class="link" @click="href">看源码</el-link>
        </div>
        <div class="desc" v-for="(d,index) in desc" :key="index">{{index+1}}、{{d}}</div>
        <el-button size="small" class="dasang" @click="dashang">打赏</el-button>
        <div class="dashangDiv" v-if="show" @click="show = false">
            <img src="../../assets/qrcode.jpg" alt="">
        </div>
    </el-card>
</template>

<script>
    import {name , homepage_url} from '../../manifest.development'
    import utils from "../../utils";
    export default {
        name: 'app',
        data(){
            return {
                name,
                homepage_url,
                desc: [
                    "打开谷歌浏览器开发工具，在标签页中点击插件标签",
                    "在设置中自定义下载的配置",
                    "然后选择你想要下载的资源，点击相应的按钮即可",
                    "如果想自己开发一个这样的插件，可以点击看源码去github下载源码,记得不要忘记给星哦，^_^",
                    "qq：305371179，欢迎互相交流学习"
                ],
                show: false
            }
        },
        methods:{
            href(){
                utils.openWindow(this.homepage_url)
            },
            dashang(){
                this.show = true
            }
        }
    }
</script>

<style>
    .box-card {
        width: 300px;
        position: relative;
    }
    .box-card .title{
        font-weight: bold;
        font-size: 18px;
    }
    .link{
        float: right;
        font-size: 16px;
    }
    .desc{
        font-size: 16px;
        color: #222222;
        line-height: 1.5;
    }
    .dasang{
        float:right;
        margin-bottom: 8px;
    }
    .dashangDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    .dashangDiv img{
        width:90%;
        height:auto;
    }
</style>
