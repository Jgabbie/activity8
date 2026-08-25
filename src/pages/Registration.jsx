import { useState } from 'react'
import "../App.css"
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'

import LocationOnIcon from '@mui/icons-material/LocationOn'
import MapIcon from '@mui/icons-material/Map'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from "leaflet"
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
})

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { IconButton } from '@mui/material'

function Registration() {
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [course, setCourse] = useState("")

    const [students, setStudents] = useState([])
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleDelete = (id) => {
        setStudents((prev) => prev.filter((student) => student.id !== id))
    }

    const columns = [
        { accessorKey: "firstname", header: "First Name" },
        { accessorKey: "lastname", header: "Last Name" },
        { accessorKey: "course", header: "Course" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "address", header: "Address" },
        {
            id: "coordinates", header: "Coordinates (Lat., Long.)",
            cell: ({ row }) => (
                <span className='text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200'>
                    {row.original.latitude?.toFixed(4)}. {row.original.longitude?.toFixed(4)}
                </span>
            )
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <IconButton color='error' size='small' onClick={() => handleDelete(row.original.id)} title='Delete Student'>
                    <DeleteIcon />
                </IconButton>
            )
        }
    ]

    const table = useReactTable({
        data: students, columns, getCoreRowModel: getCoreRowModel(),
    })


    const handleAdd = async (e) => {
        e.preventDefault()

        if (!firstname || !lastname || !email || !address) return setError("Fill in all the fields!")

        setLoading(true)

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            )

            const data = await response.json()

            if (data.length === 0) {
                setError("Address not found");
                return;
            }

            const result = data[0]
            const newStudent = {
                id: Date.now(),
                firstname,
                lastname,
                course,
                email,
                address,
                latitude: Number(result.lat),
                longitude: Number(result.lon)
            }

            setStudents((prev) => [...prev, newStudent])



            setFirstname("")
            setLastname("")
            setEmail("")
            setAddress("")
            setCourse("")
            setError("")

            setSuccess(true)
            setTimeout(() => setSuccess(false), 2000)

        } catch (error) {
            console.error(error)
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-slate-100'>

            <nav className="flex items-center justify-between bg-white px-6 py-8 text-black shadow-md">
                <div className='flex items-center gap-4'>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <LocationOnIcon />
                    </div>

                    <div className='flex flex-col'>
                        <Typography variant='h4'>
                            Student Location System
                        </Typography>

                        <Typography variant='caption'>
                            Register students and view their location on the map
                        </Typography>
                    </div>
                </div>

                <Card variant='elevation' className='px-5 py-3 text-center'>
                    <Typography variant='caption'>TOTAL STUDENTS</Typography>
                    <Typography variant='h5'>
                        {students.length}
                    </Typography>
                </Card>

            </nav>

            <div className='grid grid-cols-1 gap-6 p-6 lg:grid-cols-2'>
                <div className='flex flex-col'>

                    <div className="flex items-center justify-between bg-white px-6 py-4 text-black shadow-md">
                        <div className='flex items-center gap-3'>
                            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white'>
                                <MapIcon />
                            </div>
                            <div className='flex flex-col'>
                                <Typography variant='h4'>
                                    Student Locations
                                </Typography>

                                <Typography variant='caption'>
                                    Interactibe Student Location Map
                                </Typography>
                            </div>
                        </div>


                        <Card className='px-5 py-3 !bg-blue-600  text-center !text-white'>
                            <Typography variant='caption'>TOTAL LOCATIONS</Typography>
                            <Typography variant='h5'>
                                {students.length}
                            </Typography>
                        </Card>

                    </div>

                    <MapContainer center={[14.5995, 121.033]} zoom={13} style={{ height: "330px", width: "100%" }}>
                        <TileLayer attribution="&copy; OpenStreetMap constributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {students.map((student) => (
                            <Marker key={student.id} position={[student.latitude, student.longitude]}>
                                <Popup>
                                    <div>
                                        <Typography variant='h5' className='font-bold text-base border-b pb-1 mb-1 text-blue-600'>
                                            {student.firstname} {student.lastname}
                                        </Typography>
                                        <Typography className='m-0 text-sm'>
                                            <span className='font-semibold'>Course: </span> {student.course}
                                        </Typography>
                                        <Typography className='m-0 text-sm'>
                                            <span className='font-semibold'>Email: </span> {student.email}
                                        </Typography>
                                        <Typography className='m-0 text-sm'>
                                            <span className='font-semibold'>Address:</span> {student.address}
                                        </Typography>

                                        <div className='flex flex-col gap-0.5'>
                                            <Typography variant='caption' className='m-0 text-sm'>
                                                <span className='font-semibold'>Latitude:</span> {""} {student.latitude}
                                            </Typography>
                                            <Typography variant='caption' className='m-0 text-sm'>
                                                <span className='font-semibold'>Longitude:</span> {""} {student.longitude}
                                            </Typography>
                                        </div>

                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div >
                    <Card variant='elevation'>
                        <CardContent className="flex flex-col gap-4">
                            <Typography variant='h5'>
                                Student Registration
                            </Typography>
                            <Typography variant='caption'>
                                Enter the student's information and address
                            </Typography>

                            <TextField label="First Name" size='small' value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                            <TextField label="Last Name" size='small' value={lastname} onChange={(e) => setLastname(e.target.value)} />
                            <FormControl size='small' fullWidth>
                                <InputLabel>
                                    Course
                                </InputLabel>
                                <Select label="Course" value={course} onChange={(e) => setCourse(e.target.value)}>
                                    <MenuItem value="BSIT">BSIT</MenuItem>
                                    <MenuItem value="BSCS">BSCS</MenuItem>
                                    <MenuItem value="BSIS">BSIS</MenuItem>
                                    <MenuItem value="BSEMC">BSEMC</MenuItem>
                                    <MenuItem value="BSA">BSA</MenuItem>
                                </Select>
                            </FormControl>


                            <TextField label="Email" size='small' value={email} onChange={(e) => setEmail(e.target.value)} />
                            <TextField label="Address" size='small' value={address} onChange={(e) => setAddress(e.target.value)} />
                            <Button variant='contained' onClick={handleAdd} className='!bg-blue-600'>{loading ? "Adding" : "Add Student"}</Button>

                            {success && <Alert severity='success'>Student Added!</Alert>}
                            {error && <Alert severity='error'>{error}</Alert>}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className='p-6'>
                <div className='overflow-hidden rounded-xl border-slate-200 bg-white shadow-md'>
                    <div className='flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-6 py-4'>
                        <div>
                            <Typography variant='h4' className='text-lg font-bold text-slate-800'>
                                Registered Students
                            </Typography>
                            <Typography variant='caption' className='text-xs text-slate-500'>
                                View all registered students and their locations
                            </Typography>
                        </div>

                        <span className='inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
                            {students.length} Total Records
                        </span>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full text-left text-sm text-slate-600'>
                            <thead className='border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className='px-6 py-3.5'>
                                                {flexRender(
                                                    header.column.columnDef.header, header.getContext()
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>

                            <tbody className='divide-y divide-slate-100'>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className='transition-colors hover:bg-slate-50/80'>
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className='whitespace-nowrap px-6 py-4'>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className='px-6 py-12 text-center text-slate-400'>
                                            <div className='flex flex-col items-center gap-1'>
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-400 text-white">
                                                    <PersonOffOutlinedIcon />
                                                </div>
                                                <Typography variant='h5' className='text-sm font-medium text-slate-500'>
                                                    No Student Records
                                                </Typography>
                                                <Typography variant='caption' className='text-xs text-slate-400'>
                                                    Register a student to display records.
                                                </Typography>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Registration