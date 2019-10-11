<template>
    <div class="container" ref="container">
        <!--<div class="top" ref="top">
            <el-button @click="save">下载</el-button>
            <el-button @click="reload">刷新</el-button>
            <el-button @click="refresh">重载</el-button>
        </div>-->
<!--        {{images}}-->
<!--        {{sizes}}-->
        <el-table
                stripe
                :height="tableHeight"
                class="table"
                ref="multipleTable"
                :data="tableData"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column
                    label="操作"
                    width="300">
                <template slot-scope="scope">
                    <el-button size="mini"  @click="download(scope)">下载</el-button>
                    <el-button size="mini"
                               v-clipboard:copy="scope.row.url"
                               v-clipboard:success="copySuccess"
                               v-clipboard:error="copyError"
                    >复制链接</el-button>
                    <el-button size="mini"  @click="openWindow(scope)">查看</el-button>
                </template>

            </el-table-column>
            <el-table-column
                    label="预览"
                    width="140">
                <el-image v-if="!isBlob(scope.row.url)"  width="120" slot-scope="scope" :src="scope.row.url"  :preview-src-list="[scope.row.url]"  @load="load($event,scope)"></el-image>
                <span v-else>
                    blob图片无法预览
                </span>
<!--                <img  width="120" slot-scope="scope" :src="scope.row.url"  :preview-src-list="[scope.row.url]"  @load="load($event,scope)"></img>-->

            </el-table-column>
            <el-table-column
                    prop="name"
                    label="名称"
                    width="200">
                <template slot-scope="scope">
                    {{ scope.row.url | name}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="尺寸"
                    width="120">
                <template slot-scope="scope">
                    {{ scope.row | size}}
                </template>
            </el-table-column>
            <el-table-column
                    prop="address"
                    label="地址"
                    show-overflow-tooltip>
                <template slot-scope="scope">
                    {{ scope.row.url | decode}}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import utils from "../../utils";
    import mixins from "../mixins";

    export default {
        name: "images",
        mixins:[mixins],
        props:{
            data:{
                type: Array,
                default(){
                    return []
                }
            }
        },
        watch: {
          data:{
              immediate: true,
              deep:true,
              handler(){
                  this.setTableData()
              }
          },
          // sizes:{
          //     deep: true,
          //     handler(){
          //         this.setTableData()
          //     }
          // }
        },
        computed:{
            urls(){
                let urls = []
                this.data.forEach(item=>{
                    urls.push(item.url)
                })
                return urls
            }
        },

        data(){
            return {
                multipleSelection: [],
                tableData: [],
                sizes:{},

            }
        },
        methods:{
            isBlob(url){
                return url.startsWith('blob:')
            },
            openWindow(scope){
                utils.preview(scope.row.url)
                // utils.openWindow(scope.row.url)
            },
            // copySuccess(){
            //     this.$message({
            //         type: 'success',
            //         message: '复制成功'
            //     })
            // },
            // copyError(){
            //     this.$message({
            //         type: 'error',
            //         message: '复制失败'
            //     })
            // },
            download(item){
                utils.save([item.row])
            },
            setTableData(){
                this.tableData = []
                this.data.forEach(item=>{
                    this.tableData.push({
                        ...item,
                        ...this.sizes[item.url]
                    })
                })

            },
            load(e,scope){
                this.sizes[scope.row.url] = {width: e.target.naturalWidth,height: e.target.naturalHeight}
                this.setTableData()
                this.resize && this.resize()
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
                this.$emit('change','images',this.multipleSelection)
            }
        },

    }
</script>

<style scoped>
    .container{
        height:100%;
        /*overflow: hidden;*/
        overflow-y: auto;
    }
    .top{
        height:60px;
    }

</style>
<style>
    .container .el-icon-circle-close{
        color:white;
    }
</style>
