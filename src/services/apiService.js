import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiService = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
    tagTypes: ["Tasks"],
    endpoints: (builder) => ({
        getTasks: builder.query({
            query: () => "/tasks",
            transformResponse: (tasks) => tasks.reverse(),
            providesTags: ["Tasks"],
        }),
        addTask: builder.mutation({
            query: (task) => ({
                url: "/tasks",
                method: "POST",
                body: task,
            }),
            invalidatesTags: ["Tasks"],
            // Optimistic updates
            async onQueryStarted(task, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    apiService.util.updateQueryData("getTasks", undefined, (draft) => {
                        draft.unshift({ id: task.length + 1, ...task })
                    })
                );
                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo()
                }
            }
        }),
        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/tasks/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Tasks"],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    apiService.util.updateQueryData("getTasks", undefined, (tasksList) => {
                        const taskIndex = tasksList.findIndex((el) => el.id === id);
                        tasksList.splice(taskIndex, 1)
                    })
                );
                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo()
                }
            }
        }),
        updateTask: builder.mutation({
            query: ({ id, ...updatedTask }) => ({
                url: `/tasks/${id}`,
                method: "PATCH",
                body: updatedTask,
            }),
            invalidatesTags: ["Tasks"],
            async onQueryStarted(
                { id, ...updatedTask },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    apiService.util.updateQueryData("getTasks", undefined, (tasksList) => {
                        const taskIndex = tasksList.findIndex((el) => el.id === id);
                        tasksList[taskIndex] = { ...tasksList[taskIndex], ...updatedTask };
                    }),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
    })
})

export const { useGetTasksQuery, useAddTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation } = apiService;