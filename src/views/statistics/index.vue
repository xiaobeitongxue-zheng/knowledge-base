<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>数据统计</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-body">
            <div class="card-icon document-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">文档总数</div>
              <div class="card-value">{{ statistics.documentCount }}</div>
              <div class="card-trend" :class="statistics.documentTrend > 0 ? 'up' : 'down'">
                <el-icon><component :is="statistics.documentTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                <span>{{ Math.abs(statistics.documentTrend) }}%</span>
                <span class="trend-label">较上月</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-body">
            <div class="card-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">用户总数</div>
              <div class="card-value">{{ statistics.userCount }}</div>
              <div class="card-trend" :class="statistics.userTrend > 0 ? 'up' : 'down'">
                <el-icon><component :is="statistics.userTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                <span>{{ Math.abs(statistics.userTrend) }}%</span>
                <span class="trend-label">较上月</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-body">
            <div class="card-icon view-icon">
              <el-icon><View /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">总访问量</div>
              <div class="card-value">{{ formatNumber(statistics.viewCount) }}</div>
              <div class="card-trend" :class="statistics.viewTrend > 0 ? 'up' : 'down'">
                <el-icon><component :is="statistics.viewTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                <span>{{ Math.abs(statistics.viewTrend) }}%</span>
                <span class="trend-label">较上月</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-body">
            <div class="card-icon storage-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">存储空间</div>
              <div class="card-value">{{ statistics.storageSize }}</div>
              <div class="card-trend" :class="statistics.storageTrend > 0 ? 'up' : 'down'">
                <el-icon><component :is="statistics.storageTrend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                <span>{{ Math.abs(statistics.storageTrend) }}%</span>
                <span class="trend-label">较上月</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <div class="chart-title">文档创建趋势</div>
              <el-radio-group v-model="docChartRange" size="small" class="chart-radio-group">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="docChart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <div class="chart-title">访问量统计</div>
              <el-radio-group v-model="visitChartRange" size="small" class="chart-radio-group">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="visitChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-title">文档类型分布</div>
          </template>
          <div class="chart-container" ref="docTypeChart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-title">用户活跃度</div>
          </template>
          <div class="chart-container" ref="userActivityChart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-title">摘要生成数量</div>
          </template>
          <div class="chart-container" ref="summaryChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="table-title">热门文档排行</div>
          <el-button-group>
            <el-button size="small" @click="exportData">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
            <el-button size="small" @click="refreshData">
              <el-icon><RefreshRight /></el-icon> 刷新
            </el-button>
          </el-button-group>
        </div>
      </template>
      <el-table :data="hotDocuments" style="width: 100%" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column prop="title" label="文档标题" min-width="250" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="author" label="创建人" width="120" />
        <el-table-column prop="viewCount" label="访问量" width="100" sortable />
        <el-table-column prop="downloadCount" label="下载量" width="100" sortable />
        <el-table-column prop="commentCount" label="评论数" width="100" sortable />
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { 
  Document, User, View, FolderOpened, 
  ArrowUp, ArrowDown, Download, RefreshRight 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 统计数据
const statistics = reactive({
  documentCount: 1256,
  documentTrend: 12.5,
  userCount: 328,
  userTrend: 8.3,
  viewCount: 15680,
  viewTrend: 23.8,
  storageSize: '128.5GB',
  storageTrend: -5.2
})

// 图表日期范围
const docChartRange = ref('month')
const visitChartRange = ref('month')

// 图表引用
const docChart = ref<HTMLElement | null>(null)
const visitChart = ref<HTMLElement | null>(null)
const docTypeChart = ref<HTMLElement | null>(null)
const userActivityChart = ref<HTMLElement | null>(null)
const summaryChart = ref<HTMLElement | null>(null)

// 定义热门文档类型接口
interface HotDocument {
  title: string;
  category: string;
  author: string;
  viewCount: number;
  downloadCount: number;
  commentCount: number;
  updateTime: string;
}

// 热门文档表格数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const hotDocuments = ref<HotDocument[]>([
  {
    title: '企业知识库系统设计方案',
    category: '技术文档',
    author: '张三',
    viewCount: 982,
    downloadCount: 325,
    commentCount: 58,
    updateTime: '2024-04-09 14:30'
  },
  {
    title: '基于深度学习的文本摘要算法比较',
    category: '研究报告',
    author: '李四',
    viewCount: 754,
    downloadCount: 246,
    commentCount: 42,
    updateTime: '2024-04-08 16:45'
  },
  {
    title: '用户调研分析报告',
    category: '市场文档',
    author: '王五',
    viewCount: 698,
    downloadCount: 187,
    commentCount: 36,
    updateTime: '2024-04-08 11:20'
  },
  {
    title: '产品功能需求说明书',
    category: '产品文档',
    author: '赵六',
    viewCount: 652,
    downloadCount: 198,
    commentCount: 29,
    updateTime: '2024-04-07 15:30'
  },
  {
    title: '系统架构设计文档',
    category: '技术文档',
    author: '张三',
    viewCount: 567,
    downloadCount: 201,
    commentCount: 31,
    updateTime: '2024-04-07 10:15'
  }
])

// 格式化数字
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 初始化图表
const initCharts = () => {
  // 文档创建趋势图
  const docChartInstance = echarts.init(docChart.value as unknown as HTMLDivElement)
  docChartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新建文档', '更新文档']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日', '13日', '14日', '15日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新建文档',
        type: 'line',
        stack: 'Total',
        data: [12, 13, 10, 15, 18, 8, 9, 14, 16, 18, 15, 17, 13, 12, 16],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      },
      {
        name: '更新文档',
        type: 'line',
        stack: 'Total',
        data: [22, 18, 19, 23, 25, 15, 16, 21, 23, 20, 18, 25, 20, 18, 23],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  })

  // 访问量统计图
  const visitChartInstance = echarts.init(visitChart.value as unknown as HTMLDivElement)
  visitChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['访问量', '用户数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日', '13日', '14日', '15日']
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '访问量',
        min: 0,
        max: 250,
        position: 'left'
      },
      {
        type: 'value',
        name: '用户数',
        min: 0,
        max: 50,
        position: 'right'
      }
    ],
    series: [
      {
        name: '访问量',
        type: 'bar',
        data: [120, 132, 101, 134, 90, 180, 210, 145, 162, 134, 190, 230, 210, 180, 160]
      },
      {
        name: '用户数',
        type: 'line',
        yAxisIndex: 1,
        data: [20, 22, 18, 25, 15, 30, 35, 28, 32, 25, 38, 42, 38, 32, 28],
        smooth: true
      }
    ]
  })

  // 文档类型分布图
  const docTypeChartInstance = echarts.init(docTypeChart.value as unknown as HTMLDivElement)
  docTypeChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%',
      position: 'inside',
      confine: true,
      textStyle: {
        fontSize: 14
      }
    },
    legend: {
      type: 'plain',
      orient: 'horizontal',
      top: '0%',
      left: 'center',
      itemGap: 15,
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      top: '25%'
    },
    series: [
      {
        name: '文档类型',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '60%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 485, name: '技术文档' },
          { value: 310, name: '产品文档' },
          { value: 234, name: '市场文档' },
          { value: 145, name: '研究报告' },
          { value: 82, name: '其他文档' }
        ]
      }
    ]
  })

  // 用户活跃度图
  const userActivityChartInstance = echarts.init(userActivityChart.value as unknown as HTMLDivElement)
  userActivityChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['极低', '低', '中等', '高', '极高']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [32, 65, 108, 86, 37],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ]
  })

  // 摘要生成数量图
  const summaryChartInstance = echarts.init(summaryChart.value as unknown as HTMLDivElement)
  summaryChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%',
      position: 'inside',
      confine: true,
      textStyle: {
        fontSize: 14
      }
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '摘要类型',
        type: 'pie',
        radius: ['30%', '60%'],
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
            show: false
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 687, name: '抽取式摘要' },
          { value: 435, name: '生成式摘要' }
        ]
      }
    ]
  })

  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    docChartInstance.resize()
    visitChartInstance.resize()
    docTypeChartInstance.resize()
    userActivityChartInstance.resize()
    summaryChartInstance.resize()
  })
}

// 导出数据
const exportData = () => {
  console.log('导出数据')
}

// 刷新数据
const refreshData = () => {
  console.log('刷新数据')
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 实际项目中这里应该重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 实际项目中这里应该重新加载数据
}

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})
</script>

<style scoped>
.statistics-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
}

.data-overview {
  margin-bottom: 20px;
}

.data-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
}

.card-body {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}

.card-icon .el-icon {
  font-size: 32px;
  color: #fff;
}

.document-icon {
  background-color: #409EFF;
}

.user-icon {
  background-color: #67C23A;
}

.view-icon {
  background-color: #E6A23C;
}

.storage-icon {
  background-color: #F56C6C;
}

.card-content {
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
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.card-trend.up {
  color: #67C23A;
}

.card-trend.down {
  color: #F56C6C;
}

.trend-label {
  margin-left: 5px;
  color: #909399;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
}

.chart-container {
  height: 300px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.chart-radio-group {
  transform: scale(0.9);
  transform-origin: right center;
}

:deep(.chart-radio-group .el-radio-button__inner) {
  padding: 6px 10px;
}
</style>