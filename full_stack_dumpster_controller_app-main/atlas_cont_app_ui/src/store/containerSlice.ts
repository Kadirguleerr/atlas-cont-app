import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Container, ContainerStatus } from '../types/container';
import { fetchContainersFromApi, simulateContainerApi, simulateAllContainersApi, addRandomTrashApi, addRandomTrashToAllApi, createContainerApi, deleteContainerApi } from '../services/api';

interface ContainerState {
  containers: Container[];
  selectedContainerId: number | null;
  filterStatus: ContainerStatus | 'ALL';
  searchQuery: string;
  loading: boolean;
  simulateAllLoading: boolean;
  addTrashAllLoading: boolean;
  simulatingId: number | null;
  error: string | null;
}

const initialState: ContainerState = {
  containers: [],
  selectedContainerId: null,
  filterStatus: 'ALL',
  searchQuery: '',
  loading: false,
  simulateAllLoading: false,
  addTrashAllLoading: false,
  simulatingId: null,
  error: null,
};

export const fetchContainers = createAsyncThunk(
  'containers/fetchContainers',
  async () => {
    return await fetchContainersFromApi();
  }
);

export const simulateContainer = createAsyncThunk(
  'containers/simulateContainer',
  async (id: number) => {
    return await simulateContainerApi(id);
  }
);

export const simulateAllContainers = createAsyncThunk(
  'containers/simulateAllContainers',
  async () => {
    return await simulateAllContainersApi();
  }
);

export const addRandomTrash = createAsyncThunk(
  'containers/addRandomTrash',
  async (id: number) => {
    return await addRandomTrashApi(id);
  }
);

export const addRandomTrashToAll = createAsyncThunk(
  'containers/addRandomTrashToAll',
  async () => {
    return await addRandomTrashToAllApi();
  }
);

export const createContainer = createAsyncThunk(
  'containers/createContainer',
  async (containerData: Partial<Container>) => {
    return await createContainerApi(containerData);
  }
);

export const deleteContainer = createAsyncThunk(
  'containers/deleteContainer',
  async (id: number) => {
    await deleteContainerApi(id);
    return id;
  }
);

const containerSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {
    selectContainer: (state, action: PayloadAction<number | null>) => {
      state.selectedContainerId = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<ContainerStatus | 'ALL'>) => {
      state.filterStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = action.payload;
      })
      .addCase(fetchContainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Veriler yüklenirken hata oluştu';
      })
      .addCase(simulateContainer.pending, (state, action) => {
        state.simulatingId = action.meta.arg;
      })
      .addCase(simulateContainer.fulfilled, (state, action) => {
        state.simulatingId = null;
        // Backend'in döndürdüğü payload'dan id'yi al (hem 'id' hem de '_id' olabilir)
        const payloadId = (action.payload as any).id ?? (action.payload as any)._id;
        const index = state.containers.findIndex(
          c => c.id === payloadId || (c as any)._id === payloadId
        );
        if (index !== -1) {
          // Sadece ai_analysis alanını güncelle (id karşılaştırma sorunlarını önlemek için)
          state.containers[index].ai_analysis = action.payload.ai_analysis;
        }
      })
      .addCase(simulateContainer.rejected, (state) => {
        state.simulatingId = null;
      })
      .addCase(simulateAllContainers.pending, (state) => {
        state.simulateAllLoading = true;
      })
      .addCase(simulateAllContainers.fulfilled, (state, action) => {
        state.simulateAllLoading = false;
        // Her konteynerin ai_analysis'ini güncelle (id ile eşleştir)
        action.payload.forEach((updated: Container) => {
          const updatedId = (updated as any).id ?? (updated as any)._id;
          const index = state.containers.findIndex(
            c => c.id === updatedId || (c as any)._id === updatedId
          );
          if (index !== -1) {
            state.containers[index] = updated; // Güncel çöplerin ve analizlerin tamamını al
          }
        });
      })
      .addCase(simulateAllContainers.rejected, (state) => {
        state.simulateAllLoading = false;
      })
      // Add random trash cases
      .addCase(addRandomTrash.pending, (state, action) => {
        state.simulatingId = action.meta.arg;
      })
      .addCase(addRandomTrash.fulfilled, (state, action) => {
        state.simulatingId = null;
        const payloadId = (action.payload as any).id ?? (action.payload as any)._id;
        const index = state.containers.findIndex(
          c => c.id === payloadId || (c as any)._id === payloadId
        );
        if (index !== -1) {
          state.containers[index] = action.payload; // Entire payload updated to reflect new items
        }
      })
      .addCase(addRandomTrash.rejected, (state) => {
        state.simulatingId = null;
      })
      .addCase(addRandomTrashToAll.pending, (state) => {
        state.addTrashAllLoading = true;
      })
      .addCase(addRandomTrashToAll.fulfilled, (state, action) => {
        state.addTrashAllLoading = false;
        action.payload.forEach((updated: Container) => {
          const updatedId = (updated as any).id ?? (updated as any)._id;
          const index = state.containers.findIndex(
            c => c.id === updatedId || (c as any)._id === updatedId
          );
          if (index !== -1) {
            state.containers[index] = updated; // Update entire container for items sync
          }
        });
      })
      .addCase(addRandomTrashToAll.rejected, (state) => {
        state.addTrashAllLoading = false;
      })
      .addCase(createContainer.fulfilled, (state, action) => {
        state.containers.push(action.payload);
      })
      .addCase(deleteContainer.fulfilled, (state, action) => {
        state.containers = state.containers.filter(c => c.id !== action.payload && (c as any)._id !== action.payload);
        if (state.selectedContainerId === action.payload) {
          state.selectedContainerId = null;
        }
      });
  },
});

export const { selectContainer, setFilterStatus, setSearchQuery } = containerSlice.actions;
export default containerSlice.reducer;
