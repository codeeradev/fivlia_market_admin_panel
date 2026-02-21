import { ref } from 'vue'
import { get, post, put, del } from '@/apis/apiClient'

export function useCrud<T>() {
  const items = ref<T[]>([])
  const loading = ref(false)

  const fetchAll = async (url: string) => {
    loading.value = true
    const res = await get<{ data: T[] }>(url)
    items.value = Array.isArray(res) ? res : res.data
    loading.value = false
  }

  const createItem = async (url: string, data: any) => {
    return await post(url, data)
  }

  const updateItem = async (url: string, data: any) => {
    return await put(url, data)
  }

  const deleteItem = async (url: string) => {
    return await del(url)
  }

  return {
    items,
    loading,
    fetchAll,
    createItem,
    updateItem,
    deleteItem,
  }
}
