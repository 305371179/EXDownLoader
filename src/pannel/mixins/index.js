import utils from '../../utils'
export default {
    data(){
        return {
            tableHeight:window.innerHeight
        }

    },
    filters:{
        name(value){
            return utils.getFileNameExt(value)
        },
        decode(value){
            return decodeURIComponent(value)
        },
        size(value){
            // sendMessage(value)
            if(!value.width)return
            return value.width + 'x' + value.height
        }
    },
    methods: {
        openWindow(scope){
            utils.preview(scope.row.url)
            // utils.openWindow(scope.row.url)
        },
        copySuccess(){
            this.$message({
                type: 'success',
                message: '复制成功'
            })
        },
        copyError(){
            this.$message({
                type: 'error',
                message: '复制失败'
            })
        },
    },
    mounted() {
        this.resize= ()=>{
            this.tableHeight = window.innerHeight - this.$refs.container.getBoundingClientRect().y //-this.$refs.top.getBoundingClientRect().height
        }
        setTimeout(()=>{
            this.resize()
        },500)

        setTimeout(()=>{
            this.resize()
        },1500)

        window.addEventListener('resize',this.resize)
    },
    beforeDestroy() {
        window.removeEventListener('resize',this.resize)
    }
}
