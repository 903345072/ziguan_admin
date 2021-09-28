import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/broker/getAll',
    method: 'get',
    params: query
  })
}

export function getChuQuan(query) {
  return request({
    url: '/broker/getChuQuan',
    method: 'get',
    params: query
  })
}

export function updateChuQuan(data) {
  return request({
    url: '/broker/updateChuQuan',
    method: 'post',
    data
  })
}

export function addChuQuan(data) {
  return request({
    url: '/broker/addChuQuan',
    method: 'post',
    data
  })
}

export function deleteChuQuan(data) {
  return request({
    url: '/broker/deleteChuQuan',
    method: 'post',
    data
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/broker/addBroker',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/broker/updateBroker',
    method: 'post',
    data
  })
}

export function updateAdminStatus(data) {
  return request({
    url: '/broker/updateStatus',
    method: 'post',
    data
  })
}
