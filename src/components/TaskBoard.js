import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Database from "../utils/database";
import { Button, IconButton, Modal, TextField, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { NewTaskModal } from "./NewTaskModal";
import { v4 as uuidv4 } from 'uuid';

var categoryToIdMap = {};



export const TaskBoard = (props) => {
    const [columns, setColumns] = useState({});

    // Modal states
    const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

    const handleNewTaskModalOpen = () => setNewTaskModalOpen(true);
    const handleNewTaskModalClose = () => setNewTaskModalOpen(false);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
    
        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            Database.updateTaskData(props.teamId,
                {
                    category: sourceColumn.name,
                    ...removed
                },
                {
                    category: destColumn.name,
                    ...removed
                });
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        }
    };
    
    const getTaskData = async () => {
        let snapshot = await Database.getProtectedTeamData(props.teamId);
        let data = snapshot.data();
        let columnsData = {};
        for (let index = 0; index < data.taskCategories.length; index++) {
            let categoryId = uuidv4();
            columnsData[categoryId] = {
                name: data.taskCategories[index],
                items: []
            };
            categoryToIdMap[data.taskCategories[index]] = categoryId;
        }
        for (let index = 0; index < data.tasks.length; index++) {
            let category = data.tasks[index].category;
            let categoryData = {
                id: data.tasks[index].id,
                title: data.tasks[index].title,
                description: data.tasks[index].description,
            }
            columnsData[categoryToIdMap[category]].items.push(categoryData);
        }
        setColumns(columnsData);
    }

    const handleNewTask = (taskData) => {
        let columnsData = columns;
        let uploadData = {
            id: uuidv4(),
            ...taskData
        }
        columnsData[categoryToIdMap[taskData.category]].items.push(uploadData);
        Database.createNewTask(props.teamId, uploadData);
        setColumns(columnsData);
        handleNewTaskModalClose();
    }
    const handleTaskRemove = async (columnId, column, item) => {
        await Database.removeTask(props.teamId, {category: column.name, ...item});
        setColumns({
            ...columns,
            [columnId]: {
                ...column,
                items: column.items.filter((searchItem, index) => {
                    return searchItem !== item;
                })
            }
        });
    }

    useEffect(() => {
        getTaskData();
    }, [props]);

    return (
        <>
            <Modal open={newTaskModalOpen} onClose={handleNewTaskModalClose}>
                <NewTaskModal columns={columns} onNewTask={handleNewTask} />
            </Modal>
            <div style={{ margin: 10 }}>
                <Button onClick={handleNewTaskModalOpen}>Create task</Button>
                <br />
                <div style={{ display: "flex", height: "100%", overflow: "scroll" }}>
                    <DragDropContext
                        onDragEnd={result => onDragEnd(result)}
                    >
                        {Object.entries(columns).map(([columnId, column], index) => {
                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                    }}
                                    key={columnId}
                                >
                                    <h2>{column.name}</h2>
                                    <div style={{ margin: 8 }}>
                                        <Droppable droppableId={columnId} key={columnId}>
                                            {(provided, snapshot) => {
                                                return (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        style={{
                                                            background: snapshot.isDraggingOver
                                                                ? "var(--board-focus-color)"
                                                                : "var(--board-color)",
                                                            padding: 4,
                                                            borderRadius: 7,
                                                            width: 250,
                                                            minHeight: 500
                                                        }}
                                                    >
                                                        {column.items.map((item, index) => {
                                                            return (
                                                                <Draggable
                                                                    key={item.id}
                                                                    draggableId={item.id}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => {
                                                                        return (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={{
                                                                                    userSelect: "none",
                                                                                    padding: 16,
                                                                                    margin: "0 0 8px 0",
                                                                                    backgroundColor: snapshot.isDragging
                                                                                        ? "#1d2d33"
                                                                                        : "#2d454f",
                                                                                    color: "white",
                                                                                    borderRadius: 7,
                                                                                    overflow: "auto",
                                                                                    ...provided.draggableProps.style
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    style={{
                                                                                        verticalAlign: "middle",
                                                                                        display: "inline-block",
                                                                                        width: 170
                                                                                    }}>{item.title}</Typography>
                                                                                <IconButton onClick={() => {handleTaskRemove(columnId, column, item)}}>
                                                                                    <DeleteIcon />
                                                                                </IconButton>
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </Draggable>
                                                            );
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                );
                                            }}
                                        </Droppable>
                                    </div>
                                </div>
                            );
                        })}
                    </DragDropContext>
                </div>
            </div>
        </>
    );
}