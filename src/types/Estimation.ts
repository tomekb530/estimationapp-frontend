import { EstimationDuration } from './EstimationDuration'

export type Estimation = {
    id: number
    name: string
    description: string
    project_id: number
    price: number
    duration: number
    type: EstimationDuration
    created_at: string
    updated_at: string
}