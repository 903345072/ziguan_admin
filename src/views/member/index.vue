<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.nickname" :placeholder="$t('table.nickname')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.admin_username" :placeholder="$t('table.admin_name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-select v-model="listQuery.status" :placeholder="$t('table.status')" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item | cnStatus" :value="item" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.date')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.nickname')" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保证金" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.deposit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.p_admin.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" min-width="100px">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | cnStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-permission="['freeze_user']" size="mini" :type="row.status | statusFilter" @click="handleModifyStatus(row,'published')">
            {{ row.status | opStatus }}
          </el-button>
          <el-button v-permission="['givemoney']" size="mini" :type="row.status | statusFilter" @click="giveMoney(row)">
            风控
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page-sizes="[10,20,50]" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="账号" prop="username" :rules="[{ required: true, message: '请输入账号', trigger: 'blur' }]">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="nickname" :rules="[{ required: true, message: '请输入姓名', trigger: 'blur' }]">
          <el-input v-model="temp.nickname" />
        </el-form-item>
        <el-form-item :label="$t('table.passwd')" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="代理id" prop="invite_id" :rules="[{ required: true, message: '请输入代理id', trigger: 'blur' }]">
          <el-input v-model="temp.invite_id" />
        </el-form-item>
        <el-form-item label="操盘金额" prop="total_capital" :rules="[{ required: true, message: '请输入操盘金额', trigger: 'blur' }]">
          <el-input v-model="temp.total_capital" />
        </el-form-item>
        <el-form-item label="保证金" prop="deposit" :rules="[{ required: true, message: '保证金', trigger: 'blur' }]">
          <el-input v-model="temp.deposit" />
        </el-form-item>
        <el-form-item label="配资金额" prop="leverage_money" :rules="[{ required: true, message: '请输入配资金额', trigger: 'blur' }]">
          <el-input v-model="temp.leverage_money" />
        </el-form-item>
        <el-form-item label="平仓预警线" prop="loss_warning_line" :rules="[{ required: true, message: '请输入平仓预警线', trigger: 'blur' }]">
          <el-input v-model="temp.loss_warning_line" />
        </el-form-item>
        <el-form-item label="平仓线" prop="loss_sell_line" :rules="[{ required: true, message: '请输入平仓线', trigger: 'blur' }]">
          <el-input v-model="temp.loss_sell_line" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="createData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogFormVisible_">
      <el-form ref="dataForm1" :rules="rules" :model="temp" label-position="left" label-width="200px" style="width: 400px; margin-left:50px;">
        <el-form-item label="佣金比例(千)" prop="fengkong.yj_rate" :rules="[{ required: true, message: '佣金比例', trigger: 'blur' }]">
          <el-input v-model="temp.fengkong.yj_rate" />
        </el-form-item>
        <el-form-item label="能否交易科创板(1:能0:不能)" prop="fengkong.is_kc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-input v-model="temp.fengkong.is_kc" />
        </el-form-item>
        <el-form-item label="科创持仓上限" prop="fengkong.kc_max" :rules="[{ required: true, message: '请输入科创持仓上限', trigger: 'blur' }]">
          <el-input v-model="temp.fengkong.kc_max" />
        </el-form-item>
        <el-form-item label="单股持仓上限" prop="fengkong.single_max" :rules="[{ required: true, message: '请输入单个股票持仓上限', trigger: 'blur' }]">
          <el-input v-model="temp.fengkong.single_max" />
        </el-form-item>
        <el-form-item label="禁止买入名单,逗号隔开(sh60000,sz30000)" prop="fengkong.forbid_list" >
          <el-input v-model="temp.fengkong.forbid_list" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { updateAdminStatus, fetchMemberList, updateMemberFengkong, createMember } from '@/api/Member'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP1', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    cnStatus(status) {
      const statusMap_ = {
        0: '无效',
        1: '有效'
      }
      return statusMap_[status]
    },
    opStatus(status) {
      const statusMap_ = {
        0: '恢复',
        1: '冻结'
      }
      return statusMap_[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      checkedroles: [],
      isIndeterminate: true,
      checkAll: false,
      roles: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        admin_username: undefined,
        page: 1,
        limit: 10,
        nickname: undefined,
        sort: '-id',
        status: undefined
      },
      importanceOptions: [0, 1],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [0, 1],
      showReviewer: false,
      temp: {
        id: undefined,
        status: 1,
        fengkong: {}
      },
      dialogFormVisible: false,
      dialogFormVisible_: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getcheckedroles(roles_) {
      var arr_ = []
      roles_.forEach(function(k, v) {
        arr_.push(k['id'])
      })
      return arr_
    },
    handleCheckAllChange(val) {
      var arr = []
      if (val) {
        this.roles.forEach(function(k, v) {
          arr.push(k['id'])
        })
      }
      this.checkedroles = val ? arr : []
      this.isIndeterminate = false
    },
    handleCheckedrolesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.roles.length
      this.checkedroles = value
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.roles.length
    },
    getList() {
      this.listLoading = true
      fetchMemberList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.count[0]
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    giveMoney(row) {
      this.temp.id = row.id // copy obj
      this.temp.fengkong = row.fengkong
      this.dialogFormVisible_ = true
    },
    handleModifyStatus(row) {
      updateAdminStatus({ id: row.id, status: row.status === 0 ? 1 : 0 }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = row.status === 0 ? 1 : 0
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        status: 1,
        id: undefined,
        fengkong: {}
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.checkedroles = []
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createMember(this.temp).then((res) => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功.',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.checkedroles = this.getcheckedroles(row.role)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm1'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.fengkong['uid'] = this.temp.id
          updateMemberFengkong(tempData.fengkong).then(() => {
            this.dialogFormVisible_ = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '更新成功.',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['id', '创建时间', '用户名', '状态']
        const filterVal = ['id', 'created_at', 'username', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
