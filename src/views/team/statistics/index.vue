<template>
  <div class="team-statistics">
    <el-card class="filter-container">
      <div class="filter-header">
        <h2>团队数据统计</h2>
        <div class="filter-options">
          <el-select v-model="filter.teamId" placeholder="选择团队" clearable @change="loadTeamStatistics">
            <el-option v-for="team in teamList" :key="team.id" :label="team.name" :value="team.id" />
          </el-select>
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            @change="loadTeamStatistics"
          />
          <el-button type="primary" :icon="Refresh" @click="refreshData">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" v-for="(item, index) in statisticCards" :key="index">
        <el-card class="statistic-card" :class="item.className">
          <div class="card-content">
            <div class="card-icon">
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>成员角色分布</span>
              <el-radio-group v-model="roleChartType" size="small" @change="updateRoleChart">
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div v-loading="loading.roleChart">
            <div id="role-distribution-chart" style="width: 100%; height: 350px;"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>知识文档分布</span>
              <el-radio-group v-model="docChartType" size="small" @change="updateDocChart">
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div v-loading="loading.docChart">
            <div id="knowledge-documents-chart" style="width: 100%; height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>团队活动趋势</span>
              <el-select v-model="activityMetric" size="small" @change="updateActivityChart">
                <el-option label="文档创建数" value="created" />
                <el-option label="文档编辑数" value="edited" />
                <el-option label="文档访问数" value="viewed" />
              </el-select>
            </div>
          </template>
          <div v-loading="loading.activityChart">
            <div id="activity-trend-chart" style="width: 100%; height: 350px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { 
  Refresh, 
  User, 
  Document, 
  View, 
  Edit
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 图表实例
type ChartInstances = {
  roleChart: echarts.ECharts | null;
  docChart: echarts.ECharts | null;
  activityChart: echarts.ECharts | null;
}

// 数据过滤条件
const filter = reactive({
  teamId: '',
  dateRange: [] as string[]
})

// 图表类型
const roleChartType = ref('pie')
const docChartType = ref('pie')
const activityMetric = ref('created')

// 加载状态
const loading = reactive({
  roleChart: false,
  docChart: false,
  activityChart: false
})

// 统计卡片数据
const statisticCards = reactive([
  { 
    title: '团队成员', 
    value: 0, 
    icon: 'User', 
    className: 'member-card' 
  },
  { 
    title: '知识文档', 
    value: 0, 
    icon: 'Document', 
    className: 'document-card' 
  },
  { 
    title: '月访问量', 
    value: 0, 
    icon: 'View', 
    className: 'visit-card' 
  },
  { 
    title: '文档编辑次数', 
    value: 0, 
    icon: 'Edit', 
    className: 'edit-card' 
  }
])

// 团队列表
const teamList = reactive([
  { id: '1', name: '研发团队' },
  { id: '2', name: '产品团队' },
  { id: '3', name: '测试团队' },
  { id: '4', name: '运营团队' }
])

// 图表数据
const roleDistributionData = reactive([
  { value: 5, name: '产品经理' },
  { value: 8, name: '前端开发' },
  { value: 10, name: '后端开发' },
  { value: 4, name: '测试工程师' },
  { value: 3, name: '运维工程师' },
  { value: 2, name: 'UI设计师' }
])

const knowledgeDocumentsData = reactive([
  { value: 42, name: '知识文档' },
  { value: 28, name: '技术文档' },
  { value: 15, name: '用户手册' },
  { value: 12, name: 'API文档' },
  { value: 8, name: '会议记录' },
  { value: 20, name: '其他' }
])

const activityTrendData = reactive({
  dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
  created: [10, 15, 20, 25, 30, 40],
  edited: [15, 20, 30, 40, 50, 60],
  viewed: [50, 80, 100, 120, 150, 200]
})

// 图表实例
const charts: ChartInstances = {
  roleChart: null,
  docChart: null,
  activityChart: null
}

// 初始化图表
const initCharts = () => {
  // 初始化角色分布图表
  charts.roleChart = echarts.init(document.getElementById('role-distribution-chart') as HTMLElement)
  
  // 初始化文档分布图表
  charts.docChart = echarts.init(document.getElementById('knowledge-documents-chart') as HTMLElement)
  
  // 初始化活动趋势图表
  charts.activityChart = echarts.init(document.getElementById('activity-trend-chart') as HTMLElement)
  
  // 更新所有图表
  updateRoleChart()
  updateDocChart()
  updateActivityChart()
  
  // 更新统计卡片数据
  updateStatisticCards()
}

// 更新角色分布图表
const updateRoleChart = () => {
  if (!charts.roleChart) return
  
  loading.roleChart = true
  
  // 清空当前图表
  charts.roleChart.clear()
  
  // 饼图配置
  const pieOption = {
    title: {
      text: '成员角色分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: roleDistributionData.map(item => item.name)
    },
    xAxis: roleChartType.value === 'pie' ? undefined : {},
    yAxis: roleChartType.value === 'pie' ? undefined : {},
    series: [
      {
        name: '角色',
        type: 'pie',
        radius: ['40%', '70%'], // 环形图
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: roleDistributionData
      }
    ]
  }
  
  // 柱状图配置
  const barOption = {
    title: {
      text: '成员角色分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: roleDistributionData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: roleDistributionData.map(item => item.value),
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
  
  // 根据选择的图表类型设置配置
  charts.roleChart.setOption(roleChartType.value === 'pie' ? pieOption : barOption, true)
  setTimeout(() => {
    loading.roleChart = false
  }, 500)
}

// 更新文档分布图表
const updateDocChart = () => {
  if (!charts.docChart) return
  
  loading.docChart = true
  
  // 清空当前图表
  charts.docChart.clear()
  
  // 饼图配置
  const pieOption = {
    title: {
      text: '知识文档分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: knowledgeDocumentsData.map(item => item.name)
    },
    xAxis: docChartType.value === 'pie' ? undefined : {},
    yAxis: docChartType.value === 'pie' ? undefined : {},
    series: [
      {
        name: '文档',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: knowledgeDocumentsData
      }
    ]
  }
  
  // 柱状图配置
  const barOption = {
    title: {
      text: '知识文档分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: knowledgeDocumentsData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: knowledgeDocumentsData.map(item => item.value),
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
  
  // 根据选择的图表类型设置配置
  charts.docChart.setOption(docChartType.value === 'pie' ? pieOption : barOption, true)
  setTimeout(() => {
    loading.docChart = false
  }, 500)
}

// 更新活动趋势图表
const updateActivityChart = () => {
  if (!charts.activityChart) return
  
  loading.activityChart = true
  
  const option = {
    title: {
      text: '团队活动趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: activityTrendData.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: activityMetric.value === 'created' ? '文档创建数' : 
              activityMetric.value === 'edited' ? '文档编辑数' : '文档访问数',
        type: 'line',
        smooth: true,
        data: activityTrendData[activityMetric.value],
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        },
        areaStyle: {}
      }
    ]
  }
  
  charts.activityChart.setOption(option)
  setTimeout(() => {
    loading.activityChart = false
  }, 500)
}

// 更新统计卡片数据
const updateStatisticCards = () => {
  // 这里可以通过API获取数据
  // 示例数据
  statisticCards[0].value = roleDistributionData.reduce((sum, item) => sum + item.value, 0)
  statisticCards[1].value = knowledgeDocumentsData.reduce((sum, item) => sum + item.value, 0)
  statisticCards[2].value = 852
  statisticCards[3].value = 237
}

// 加载团队统计数据
const loadTeamStatistics = () => {
  // 在实际应用中，这里可以调用API获取数据
  ElMessage.success('数据加载成功')
  
  // 模拟数据加载
  loading.roleChart = true
  loading.docChart = true
  loading.activityChart = true
  
  setTimeout(() => {
    // 更新图表
    updateRoleChart()
    updateDocChart()
    updateActivityChart()
    updateStatisticCards()
  }, 800)
}

// 刷新数据
const refreshData = () => {
  ElMessage.info('正在刷新数据...')
  loadTeamStatistics()
}

// 处理窗口大小变化
const handleResize = () => {
  charts.roleChart?.resize()
  charts.docChart?.resize()
  charts.activityChart?.resize()
}

// 组件挂载时初始化
onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.roleChart?.dispose()
  charts.docChart?.dispose()
  charts.activityChart?.dispose()
  charts.roleChart = null
  charts.docChart = null
  charts.activityChart = null
})
</script>

<style scoped>
.team-statistics {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistic-card {
  margin-bottom: 20px;
  height: 100px;
  border-radius: 8px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 16px;
  font-size: 24px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.member-card .card-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.document-card .card-icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.visit-card .card-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.edit-card .card-icon {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-options {
    width: 100%;
    justify-content: space-between;
  }
}
</style>