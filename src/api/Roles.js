import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userRole/get',
    method: 'get',
    params: query
  })
}

export function createCardd(data) {
  return request({
    url: '/userRole/add',
    method: 'post',
    data
  })
}

export function updateRoled(data) {
  return request({
    url: '/userRole/updated',
    method: 'post',
    data
  })
}

export function updateCardStatus(data) {
  return request({
    url: '/userRole/delete',
    method: 'get',
    params: data
  })
}
