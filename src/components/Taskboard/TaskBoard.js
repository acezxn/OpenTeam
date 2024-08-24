import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Database from "../../utils/database";
import { Button, IconButton, Menu, MenuItem, Modal, Typography } from "@mui/material";
import { NewTaskModal } from "./modals/NewTaskModal";
import { v4 as uuidv4 } from 'uuid';
import { EditTaskModal } from "./modals/EditTaskModal";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { NewCategoryModal } from "./modals/NewCategoryModal";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { ConfirmationModal } from "../modals/ConfirmationModal";
import DatabaseManager from "../../utils/databaseManager";
var categoryToIdMap = Object.create(null);

export const TaskBoard = (props) => {
    const [columns, setColumns] = useState(Object.create(null));
    const [selectedTaskData, setSelectedTaskData] = useState(Object.create(null));
    const [selectedColumn, setSeletedColumn] = useState(Object.create(null));
    const [selectedColumnId, setSeletedColumnId] = useState("");
    const [anchorElement, setAnchorElement] = useState(null);

    // Modal and menu states
    const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
    const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleNewTaskModalOpen = () => setNewTaskModalOpen(true);
    const handleNewTaskModalClose = () => setNewTaskModalOpen(false);
    const handleNewCategoryModalOpen = () => setNewCategoryModalOpen(true);
    const handleNewCategoryModalClose = () => setNewCategoryModalOpen(false);
    const handleEditTaskModalOpen = () => setEditTaskModalOpen(true);
    const handleEditTaskModalClose = () => setEditTaskModalOpen(false);
    const handleDeleteConfirmModalOpen = () => setDeleteConfirmModalOpen(true);
    const handleDeleteConfirmModalClose = () => setDeleteConfirmModalOpen(false);
    const handleMenuOpen = (e) => {
        setAnchorElement(e.target);
        setMenuOpen(true)
    };
    const handleMenuClose = () => setMenuOpen(false);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const oldCategoryName = sourceColumn.name;
            const newCategoryName = destColumn.name;
            const taskToRemove = sourceItems[source.index];

            DatabaseManager.TeamManager.TasksManager.changeTaskCategory(
                props.teamId,
                oldCategoryName,
                newCategoryName,
                taskToRemove
            );

            sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, taskToRemove);
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

    const getTaskData = async (data) => {
        if (!data) {
            return;
        }
        let columnsData = Object.create(null);
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
            if (categoryToIdMap[category] !== undefined && 
                columnsData[categoryToIdMap[category]] !== undefined) {
                columnsData[categoryToIdMap[category]].items.push(categoryData);
            }
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
        DatabaseManager.TeamManager.TasksManager.createNewTask(props.teamId, uploadData);
        setColumns(columnsData);
        handleNewTaskModalClose();
    }

    const handleTaskRemove = (columnId, column, item) => {
        DatabaseManager.TeamManager.TasksManager.removeTask(props.teamId, { category: column.name, ...item });
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
    const handleTaskUpdate = (taskData) => {
        setEditTaskModalOpen(false);
        DatabaseManager.TeamManager.TasksManager.updateTaskData(
            props.teamId,
            { ...selectedTaskData, category: selectedColumn.name },
            { ...taskData, category: selectedColumn.name }
        );

        // replace the old team data with the new team data
        let tasks = [];
        for (let index = 0; index < selectedColumn.items.length; index++) {
            if (selectedColumn.items[index] === selectedTaskData) {
                tasks.push({ ...taskData, id: selectedColumn.items[index].id });
            } else {
                tasks.push(selectedColumn.items[index]);
            }
        }
        setColumns({
            ...columns,
            [selectedColumnId]: {
                ...selectedColumn,
                items: tasks
            }
        });
    }
    const handleNewCategory = (categoryName) => {
        handleNewCategoryModalClose();
        DatabaseManager.TeamManager.TasksManager.createCategory(props.teamId, categoryName);
        let categoryId = uuidv4();
        setColumns({
            ...columns,
            [categoryId]: {
                name: categoryName,
                items: []
            }
        });
        categoryToIdMap[categoryName] = categoryId;
    }
    const handleCategoryRemove = () => {
        handleMenuClose();
        DatabaseManager.TeamManager.TasksManager.removeCategory(props.teamId, selectedColumn.name);
        let updatedColumns = columns;
        delete updatedColumns[selectedColumnId];
        setColumns(columns);
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "protected_team_data", props.teamId), (snapshot) => {
            getTaskData(snapshot.data());
        });
        return () => unsubscribe;
    }, [props]);


    return (
        <>
            <Menu
                PaperProps={{
                    style: {
                        backgroundColor: "var(--board-color)",
                        color: "var(--foreground-color)"
                    }
                }}
                anchorEl={anchorElement}
                open={menuOpen}
                onClose={handleMenuClose}>
                <MenuItem onClick={handleDeleteConfirmModalOpen}>Delete</MenuItem>
            </Menu>
            <Modal
                open={deleteConfirmModalOpen}
                onClose={handleDeleteConfirmModalClose}>
                <ConfirmationModal
                    onDecline={() => {
                        handleDeleteConfirmModalClose();
                        handleMenuClose();
                    }}
                    onAccept={() => {
                        handleCategoryRemove();
                        handleDeleteConfirmModalClose();
                        handleMenuClose();
                    }} />
            </Modal>
            <Modal open={newTaskModalOpen} onClose={handleNewTaskModalClose}>
                <NewTaskModal columns={columns} onNewTask={handleNewTask} />
            </Modal>
            <Modal open={editTaskModalOpen} onClose={handleEditTaskModalClose}>
                <EditTaskModal
                    columns={columns}
                    taskData={selectedTaskData}
                    onTaskDelete={() => {
                        handleTaskRemove(selectedColumnId, selectedColumn, selectedTaskData);
                        handleEditTaskModalClose();
                    }}
                    onTaskUpdate={handleTaskUpdate}
                />
            </Modal>
            <Modal open={newCategoryModalOpen} onClose={handleNewCategoryModalClose}>
                <NewCategoryModal onNewCategory={handleNewCategory} />
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
                                <div key={columnId}>
                                    <Typography variant="h6" style={{ display: "inline-block", marginLeft: 20, width: 200, overflow: "auto" }}>{column.name}</Typography>
                                    <IconButton onClick={(event) => {
                                        setSeletedColumn(column);
                                        setSeletedColumnId(columnId)
                                        handleMenuOpen(event);
                                    }}>
                                        <MoreHorizIcon />
                                    </IconButton>
                                    <Droppable droppableId={columnId} key={columnId}>
                                        {(provided, snapshot) => {
                                            return (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    style={{
                                                        background: snapshot.isDraggingOver
                                                            ? "var(--board-dark-focus-color)"
                                                            : "var(--board-dark-color)",
                                                        padding: 4,
                                                        borderRadius: 7,
                                                        width: 250,
                                                        height: "calc(100vh - 220px)",
                                                        overflow: "scroll",
                                                        margin: 8
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
                                                                                    ? "rgba(255, 255, 255, 0.2)"
                                                                                    : "rgba(255, 255, 255, 0.1)",
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
                                                                            {/* <IconButton onClick={() => { handleTaskRemove(columnId, column, item) }}>
                                                                                <MoreVertIcon />
                                                                            </IconButton> */}
                                                                            <IconButton onClick={() => {
                                                                                setSeletedColumn(column);
                                                                                setSeletedColumnId(columnId);
                                                                                setSelectedTaskData(item);
                                                                                handleEditTaskModalOpen();
                                                                            }}>
                                                                                <MoreVertIcon />
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
                            );
                        })}
                    </DragDropContext>
                    <div style={{ verticalAlign: "middle" }}>
                        <p style={{ paddingTop: 30 }}>
                            <Button startIcon={<AddIcon />} onClick={handleNewCategoryModalOpen}>Add board</Button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}