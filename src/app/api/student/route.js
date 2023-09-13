import { DB } from "@/app/libs/DB";
import { zStudentPostBody, zStudentPutBody } from "@/app/libs/schema";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  // เพิ่ม เพื่อที่เราจะ คัดกรองมาแค่ที่เราต้องการ คือ program = CPE เช็คใน query
  //2.
  const program = request.nextUrl.searchParams.get("program");

  // เช็คว่าเราสร้าง api route ขึ้นมาได้จริงมั้ย
  // return NextResponse.json({message: "this is GET route"})
  // ({message: "this is GET route"}) ก้อนนี้มันเป็น object เราอยากให้ return อะไรก็ใส่ไปได้
  // message คือ เป็นการ return ข้อความออกไป
  // return ค่า students ออกมา โดยประกาศตัวแปรขึ้นมา ให้เท่ากับ DB.students const students = DB.students;
  // return NextResponse.json({ ok: true, students });
  // return students ออก
  // เปลี่ยนเป็น return fillter แทน return NextResponse.json({ ok: true, students: filtered });
  // 1.
  const students = DB.students;
  // ดึงออกมาว่าเขาใส่อะไรมา
  //3.
  let filtered = students;
  // เช็คว่า ใส่มาจริงๆมั้ย
  if (program !== null) {
    filtered = filtered.filter((std) => std.program === program);
  }
  //4.
  return NextResponse.json({ ok: true, students: filtered });
};
// POST คือ การเพิ่มข้อมูล
export const POST = async (request) => {
  // เราต้องกำหนดข้อมูลนักศึกษาที่เราจะเพิ่มมีอะไรบ้าง -> request body
  // เช็คว่าอ่าน body ออกมาได้จริงๆหรือเปล่า -> console.log(body); -> ขึ้น true คือได้ละ
  //1.ดึง body ออกมาว่าเขาส่งอะไรมา -> const body = await request.json();
  const body = await request.json();
  //   console.log(body);
  // ต้องเช็คก่อนไปทำอะไรต่างๆ -> ใน schema เตรียมไว้ละ p.18
  // เอา schema zStudentPo ไปทดสอบ กับ body ว่า ตัวแปร body มีโครงสร้างแบบ schema ที่ออกแบบไว้หรือเปล่า
  //  studentId: zStudentId, 9 ตัว
  //   firstName: zFirstName, อย่างน้อย 3 ตัว
  //   lastName: zLastName, อย่างน้อย 3 ตัว
  //   program: zProgram,
  //   ซึ่งผลลัพธ์จะออกมาเป็น parseResult
  //2. ต้องเช็คก่อนไปทำอะไรต่างๆ
  const parseResult = zStudentPostBody.safeParse(body);
  // parseResult.success บอกว่า validate ผ่านหรือเปล่า
  // เป็นการดักถ้า validate ไม่ผ่าน -> if (parseResult.success === false)
  //3.
  if (parseResult.success === false) {
    // validate ไม่ผ่าน
    // ให้มัน return error ออกไป
    // status 400 , 401 , 404 , 500 ที่แนบกลับมากับ respons กรณี error
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issue[0].message,
      },
      {
        status: 400,
      }
    );
  }
  // ก่อนจะ add ข้อมุลเราต้องใส่เงื่อนไขไม่ให้เพิ่ม Id ที่ซ้ำกันได้ก่อน
  // findIndex เอาไว้ค้นหาสมาชิก ผลลัพธ์ ได้ตัวเลข 0,1,2,... = found
  // return -1 = not found
  // foundIndex >= 0 เช็คว่ามีอยู่จริงหรือเปล่า
  const foundIndex = DB.students.findIndex(
    (std) => std.studentId === body.studentId
  );
  if (foundIndex >= 0) {
    return NextResponse.json(
      { ok: false, message: "Student Id already exists" },
      { status: 400 }
    );
  }

  // เขียนโค้ดให้มันสามารถเพิ่มข้อมูลได้
  DB.students.push(body);
  // body.studentId คือเลข Id ที่โดนเพิ่ม
  return NextResponse.json({
    ok: true,
    meassage: `Student Id ${body.studentId}has been added`,
  });
};
// PUT คล้าย POST เลยต่างตรง schema
export const PUT = async (request) => {
  const body = await request.json();
  const parseResult = zStudentPutBody.safeParse(body);
  if (parseResult.success === false) {
    // validate ไม่ผ่าน
    // ให้มัน return error ออกไป
    // status 400 , 401 , 404 , 500 ที่แนบกลับมากับ respons กรณี error
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issue[0].message,
      },
      {
        status: 400,
      }
    );
  }
  // foundIndex === -1 ไม่มีอยู่จริง
  const foundIndex = DB.students.findIndex(
    (std) => std.studentId === body.studentId
  );
  if (foundIndex === -1) {
    return NextResponse.json(
      { ok: false, message: "Student Id already exists" },
      { status: 404 }
    );
  }
  DB.students[foundIndex] = { ...DB.students[foundIndex], ...body };

  return NextResponse.json({ ok: true });
};
