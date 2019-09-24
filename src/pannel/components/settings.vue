<template>
    <div class="settings" ref="container" :style="{height:tableHeight+'px'}">
<!--        <h3>其他设置</h3>-->
        <div>
            <label class="label">
                文件名
            </label>
            <el-tooltip class="item" effect="dark" :content="`默认多文件名称是（网站域名或者${defaultFilename}）+ 当前系统日期，例如${defaultFilename}_20191001,单文件只能资源的名称+后缀`" placement="top-start">
                <el-input  v-model="filename" placeholder="请输入文件名，可不填" class="filename isRow"></el-input>
            </el-tooltip>
        </div>
        <div style="margin: 12px 0;">
            <label class="label">
                资源下载超时时间
            </label>
            <el-tooltip class="item" effect="dark" content="当资源下载的时间超过设定的超时时间，则该资源会下载失败" placement="top-start">
                <el-input-number v-model="timeout" :min="5" label="不能低于5秒" class="isRow"></el-input-number>
            </el-tooltip>
        </div>
<!--        <h3>常规设置</h3>-->

        <div style="margin: 24px 0;">
            <el-checkbox class="isRow" v-model="settings.isCheckHAR">将资源打包成zip包(否则会很慢)</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isResourcesType">按文件类型划分目录</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isTimestamp">文件夹或者zip包名加上时间戳</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isOpenFolder">下载完之后打开文件夹</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isNotification">下载完之后通知</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isCheckBeautify">格式化html、js、css文件</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isCheckCache">读取系统的缓存（可以节省流量，提高下载速度，但可能下载不到最新资源）</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isCurrentDomain">只下载当前网站同域名资源</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isCheckContent">下载空文件</el-checkbox>
            <el-checkbox class="isRow" v-model="settings.isCheckXHR">下载通过xhr请求的资源（自动刷新页面）</el-checkbox>
        </div>

    </div>
</template>
<script>
    // import Chain from './utils/chain.js'
    // const c = new Chain()
    import utils from '../../utils/index'
    import mixins from '../mixins'
    export default {
        name: "settings",
        mixins:[mixins],
        data(){
            return {
                settings:{
                    isCheckHAR: true,
                    isOpenFolder: true,
                    isNotification: true,
                    isCheckBeautify: false,
                    isCheckCache: true,
                    isCheckContent: false,
                    isCurrentDomain:false,
                    isCheckXHR: true,
                    isTimestamp: true,
                    isResourcesType: false,
                },
                filename: '',
                defaultFilename: utils.defaultFilename,
                timeout: 15,
            }
        },
        watch:{
            settings: {
                deep:true,
                handler(){
                    utils.setSettings(this.settings)
                }
            },
            "settings.isCheckXHR"(newValue){
                if(newValue){
                    utils.reload()
                }
            },
            filename(){
                utils.setFileName(this.filename)
            },
            timeout(){
                utils.setTimeout(this.timeout)
            }
        },
        created() {
            // utils.setStorage('settings',null)
            // return
            utils.getStorage('settings').then(value=>{
                if(value&&value.settings){
                    this.settings = value.settings
                }else{
                    utils.setSettings(this.settings)
                }
            })
            utils.getStorage('filename').then(value=>{
                if(value&&value.filename){
                    this.filename = value.filename
                }else{
                    utils.setFileName(this.filename)
                }
            })
            utils.getStorage('timeout').then(value=>{
                if(value&&value.timeout){
                    this.timeout = value.timeout
                }else{
                    utils.setTimeout(this.timeout)
                }
            })
        }
    }
</script>

<style scoped>
    .isRow{
        display: block;
        margin-top: 8px;
    }
    .settings{
        padding-left:12px;
        overflow-y: auto;
    }
    .filename{
        display: block;
        width:50%;
        min-width: 180px;
        max-width: 480px;
        margin-top: 8px;
    }
    .label{
        font-size: 14px;
    }
    /*.desc{*/
    /*    width:50%;*/
    /*}*/
</style>
