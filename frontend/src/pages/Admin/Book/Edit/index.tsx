// src/pages/Admin/Book/Edit/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Row,
  Col,
  message as antdMessage,
  Spin,
  Modal,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { BaseSelectRef } from "rc-select";

import {
  authorAPI,
  publisherAPI,
  languageAPI,
  fileTypeAPI,
  bookAPI,
  bookAuthorAPI,
} from "../../../../services/https";

import type {
  Author,
  Publisher,
  Language,
  FileType,
} from "../../../../interfaces";

const API = import.meta.env.VITE_API_URL as string;
const ORANGE = "#f57c00";

const EditBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modal, modalHolder] = Modal.useModal();
  const [msg, msgHolder] = antdMessage.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [bookData, setBookData] = useState<any>(null);

  const [coverList, setCoverList] = useState<UploadFile[]>([]);
  const [ebookList, setEbookList] = useState<UploadFile[]>([]);

  // file_type_id ที่ตรวจพบ/คำนวนได้
  const [detectedFileTypeId, setDetectedFileTypeId] = useState<
    number | undefined
  >(undefined);

  // ---------- blur เคอร์เซอร์หลังเลือก ----------
  const publisherRef = useRef<BaseSelectRef | null>(null);
  const languageRef = useRef<BaseSelectRef | null>(null);
  const blurLater = (ref: React.RefObject<BaseSelectRef | null>) =>
    setTimeout(() => ref.current?.blur(), 0);

  // single-selects ในโหมด tags -> บังคับเหลือค่าเดียว
  const keepLast =
    (field: "publisher" | "language") =>
    (vals: any[]) =>
      form.setFieldsValue({ [field]: vals?.length ? [vals.at(-1)] : [] });

  /* -------------------- helpers -------------------- */
  const isId = (v: any) => /^\d+$/.test(String(v));
  const lastOrSelf = (v: any) => (Array.isArray(v) ? v.at(-1) : v);

  // ดึง URL/Path ที่ BE ส่งกลับมาหลายรูปแบบ
  const fileUrl = (f?: UploadFile) => {
    if (!f) return undefined;
    const r: any = (f as any).response || {};
    return (
      r.url ||
      r.path ||
      r.file_path ||
      r.location ||
      r.data?.url ||
      r.data?.path ||
      (typeof f.url === "string" ? f.url : undefined)
    );
  };

  const byName = (list: any[], name: string, keys: string[]) =>
    list.find((x) =>
      keys.some(
        (k) => String(x?.[k] ?? "").toLowerCase() === name.toLowerCase()
      )
    );

  // เดาชนิดไฟล์จาก mimetype/extension -> "pdf" | "epub" | undefined
  const detectTypeName = (file: any): string | undefined => {
    const mime =
      file?.type ||
      file?.response?.mime ||
      file?.response?.mimetype ||
      file?.response?.contentType;
    if (mime?.includes?.("pdf")) return "pdf";
    if (mime?.includes?.("epub")) return "epub";
    const name: string = file?.name || file?.response?.filename || "";
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "epub") return "epub";
    return undefined;
  };

  // หา/สร้าง file type ตามชื่อ แล้วคืน id
  const ensureFileTypeByName = async (
    name: string
  ): Promise<number | undefined> => {
    const hit = (fileTypes as any[]).find(
      (t) =>
        String(t?.TypeName ?? t?.type_name ?? "").toLowerCase() ===
        name.toLowerCase()
    );
    if (hit) return (hit as any).ID ?? (hit as any).id;

    const res = await fileTypeAPI.create({ type_name: name } as any);
    const created = (res?.data ?? res) as any;
    if (created) setFileTypes((prev) => [...prev, created]);
    return created?.ID ?? created?.id;
  };

  const ensureId = async (
    list: any[],
    raw: any,
    nameKeys: string[],
    create: (name: string) => Promise<any>
  ): Promise<number | undefined> => {
    const val = lastOrSelf(raw);
    if (!val || String(val).trim() === "") return undefined;
    if (isId(val)) return Number(val);
    const hit = byName(list, String(val).trim(), nameKeys);
    if (hit) return (hit.ID ?? hit.id) as number;
    const res = await create(String(val).trim());
    const created = res?.data ?? res;
    return (created?.ID ?? created?.id) as number | undefined;
  };

  const ensureMany = async (
    vals: any,
    list: any[],
    nameKeys: string[],
    create: (name: string) => Promise<any>
  ): Promise<number[]> => {
    const out: number[] = [];
    const arr = Array.isArray(vals) ? vals : vals ? [vals] : [];
    for (const v of arr) {
      const id = await ensureId(list, v, nameKeys, create);
      if (id) out.push(id);
    }
    return Array.from(new Set(out));
  };

  /* -------------------- options -------------------- */
  const authorOptions = useMemo(
    () =>
      (authors || []).map((a: any) => ({
        value: String(a.ID ?? a.id),
        label: String(
          a.AuthorName ?? a.author_name ?? a.Name ?? a.name ?? ""
        ),
      })),
    [authors]
  );
  const publisherOptions = useMemo(
    () =>
      (publishers || []).map((p: any) => ({
        value: String(p.ID ?? p.id),
        label: String(
          p.PublisherName ?? p.publisher_name ?? p.Name ?? p.name ?? ""
        ),
      })),
    [publishers]
  );
  const languageOptions = useMemo(
    () =>
      (languages || []).map((l: any) => ({
        value: String(l.ID ?? l.id),
        label: String(l.Name ?? l.name ?? ""),
      })),
    [languages]
  );

  /* -------------------- load data -------------------- */
  useEffect(() => {
    (async () => {
      try {
        if (!id) throw new Error("missing id");
        setLoading(true);

        const [a, p, l, f] = await Promise.all([
          authorAPI.getAll(),
          publisherAPI.getAll(),
          languageAPI.getAll(),
          fileTypeAPI.getAll(),
        ]);
        setAuthors(a || []);
        setPublishers(p || []);
        setLanguages(l || []);
        setFileTypes(f || []);

        const book = await bookAPI.getById(Number(id));
        setBookData(book);

        if (book?.file_type_id)
          setDetectedFileTypeId(Number(book.file_type_id));

        // ดึง authorIds
        let authorIds: number[] = [];
        if (Array.isArray(book?.authors)) {
          authorIds = book.authors
            .map((x: any) => Number(x.id ?? x.ID))
            .filter(Boolean);
        } else {
          const bas = await bookAuthorAPI.findAll({ book_id: Number(id) });
          const arr = Array.isArray(bas) ? bas : bas?.data;
          if (Array.isArray(arr)) {
            authorIds = arr
              .map((x: any) => Number(x.author_id ?? x.AuthorID))
              .filter(Boolean);
          }
        }

        form.setFieldsValue({
          title: book.title,
          isbn: book.isbn,
          totalPages: book.total_page,
          synopsis: book.synopsis,
          publishedYear: book.published_year,
          publisher: book.publisher_id ? [String(book.publisher_id)] : [],
          language: book.language_id ? [String(book.language_id)] : [],
          authors: authorIds.map(String),
        });

        if (book.cover_image)
          setCoverList([
            { uid: "cover", name: "Cover", status: "done", url: book.cover_image },
          ]);
        if (book.ebook_file)
          setEbookList([
            { uid: "ebook", name: "E-book", status: "done", url: book.ebook_file },
          ]);
      } catch (e) {
        console.error(e);
        msg.error("Failed to load book data.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, msg, navigate, form]);

  /* -------------------- submit -------------------- */
  const handleFinish = async (v: any) => {
    if (submitting || !bookData) return;
    setSubmitting(true);
    try {
      // URL ใหม่ (ถ้ามี) + fallback เป็นค่าเดิมใน DB
      const cover =
        v.cover_url ??
        fileUrl(coverList[0]) ??
        (typeof coverList[0]?.url === "string" ? coverList[0]!.url! : undefined) ??
        bookData.cover_image;

      const ebook =
        v.file_url ??
        fileUrl(ebookList[0]) ??
        (typeof ebookList[0]?.url === "string" ? ebookList[0]!.url! : undefined) ??
        bookData.ebook_file;

      const isbn =
        v?.isbn ? String(v.isbn).replace(/-/g, "") : bookData.isbn || undefined;

      // เดา file_type_id
      let fileTypeId = detectedFileTypeId;
      if (!fileTypeId && ebookList[0]) {
        const guess = detectTypeName(ebookList[0]);
        if (guess) fileTypeId = await ensureFileTypeByName(guess);
      }
      if (!fileTypeId && bookData?.file_type_id) {
        fileTypeId = Number(bookData.file_type_id);
      }
      if (!fileTypeId) {
        msg.error(
          "Cannot detect file type from e-book file. Please upload a .pdf or .epub file."
        );
        setSubmitting(false);
        return;
      }

      const [authorIds, publisherId, languageId] = await Promise.all([
        ensureMany(
          v.authors,
          authors,
          ["AuthorName", "author_name", "Name", "name"],
          (name) => authorAPI.create({ AuthorName: name } as any)
        ),
        ensureId(
          publishers,
          v.publisher,
          ["PublisherName", "publisher_name", "Name", "name"],
          (name) => publisherAPI.create({ PublisherName: name } as any)
        ),
        ensureId(
          languages,
          v.language,
          ["Name", "name"],
          (name) => languageAPI.create({ Name: name } as any)
        ),
      ]);

      // ส่ง payload แบบ unified (รองรับทั้ง PascalCase และ snake_case)
      const idNum = Number(bookData.ID ?? bookData.id);
      const totalPagesNum =
        v?.totalPages !== "" && v?.totalPages != null
          ? Number(v.totalPages)
          : undefined;
      const publishedYearNum =
        v?.publishedYear !== "" && v?.publishedYear != null
          ? Number(v.publishedYear)
          : undefined;
      const title = v.title?.trim();
      const synopsis = v?.synopsis?.trim() || undefined;

      const payload = {
        // id
        ID: idNum,
        id: idNum,

        // text fields
        Title: title,
        title,

        Synopsis: synopsis,
        synopsis,

        ISBN: isbn,
        isbn,

        // numbers
        TotalPages: totalPagesNum,
        total_page: totalPagesNum,

        PublishedYear: publishedYearNum,
        published_year: publishedYearNum,

        // fks
        PublisherID: publisherId,
        publisher_id: publisherId,

        LanguageID: languageId,
        language_id: languageId,

        FileTypeID: fileTypeId,
        file_type_id: fileTypeId,

        // files
        CoverImage: cover,
        cover_image: cover,

        EbookFile: ebook,
        ebook_file: ebook,
      };

      const res = await bookAPI.update(payload as any);
      const ok =
        (typeof res?.status === "number"
          ? res.status >= 200 && res.status < 300
          : false) || /updated/i.test(String(res?.message ?? ""));

      // sync authors (pivot)
      try {
        const current: number[] = Array.isArray(bookData?.authors)
          ? (bookData.authors as any[])
              .map((x: any) => Number(x?.id ?? x?.ID))
              .filter((n: number) => Number.isFinite(n))
          : [];
        const next = authorIds;
        const toAdd = next.filter((n) => !current.includes(n));
        const toRemove = current.filter((n) => !next.includes(n));
        await Promise.allSettled([
          ...toAdd.map((aid) =>
            bookAuthorAPI.add({ book_id: idNum, author_id: aid })
          ),
          ...toRemove.map((aid) =>
            bookAuthorAPI.removeByPair(idNum, aid)
          ),
        ]);
      } catch (e) {
        console.warn("Error syncing authors:", e);
      }

      if (ok) {
        modal.success({
          title: "Success",
          content: "The book has been updated successfully.",
          okText: "OK",
          okButtonProps: {
            style: { backgroundColor: ORANGE, borderColor: ORANGE },
          },
          onOk: () => navigate(-1),
        });
      } else {
        modal.error({
          title: "Error",
          content: "Failed to update the book. Please try again.",
          okText: "OK",
          okButtonProps: {
            style: { backgroundColor: ORANGE, borderColor: ORANGE },
          },
        });
      }
    } catch (e) {
      console.error(e);
      modal.error({
        title: "Error",
        content: "An unexpected error occurred. Please try again.",
        okText: "OK",
        okButtonProps: { style: { backgroundColor: ORANGE, borderColor: ORANGE } },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        {modalHolder}
        {msgHolder}
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading book data...</div>
      </div>
    );

  if (!bookData)
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        {modalHolder}
        {msgHolder}
        <div>Book not found</div>
        <Button onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
          Back to Books
        </Button>
      </div>
    );

  return (
    <div style={{ padding: "8px 24px 24px", background: "#fff", borderRadius: 8 }}>
      {modalHolder}
      {msgHolder}
      <h2 style={{ fontWeight: "bold", marginBottom: 24, fontSize: 28 }}>
        Edit Book
      </h2>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        onFinishFailed={() => msg.error("Please check required fields.")}
        disabled={submitting}
      >
        {/* hidden fields for uploaded URLs */}
        <Form.Item name="cover_url" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="file_url" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Enter book title" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="authors"
              label="Authors"
              rules={[
                { required: true, message: "Please provide at least one author" },
              ]}
            >
              <Select
                mode="tags"
                tokenSeparators={[","]}
                placeholder="Type author names or pick from the list"
                options={authorOptions}
                optionFilterProp="label"
                optionLabelProp="label"
                maxTagCount="responsive"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="publisher" label="Publisher">
              <Select
                ref={publisherRef}
                mode="tags"
                tokenSeparators={[","]}
                placeholder="Type a publisher or pick from the list"
                options={publisherOptions}
                optionFilterProp="label"
                optionLabelProp="label"
                onChange={(vals) => {
                  keepLast("publisher")(vals as any[]);
                  blurLater(publisherRef);
                }}
                onSelect={() => blurLater(publisherRef)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true, message: "Please provide a language" }]}
            >
              <Select
                ref={languageRef}
                mode="tags"
                tokenSeparators={[","]}
                placeholder="Type a language or pick from the list"
                options={languageOptions}
                optionFilterProp="label"
                optionLabelProp="label"
                onChange={(vals) => {
                  keepLast("language")(vals as any[]);
                  blurLater(languageRef);
                }}
                onSelect={() => blurLater(languageRef)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="totalPages"
              label="Total Pages"
              rules={[{ required: true, message: "Please enter total pages" }]}
            >
              <Input type="number" placeholder="e.g. 128" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isbn" label="ISBN">
              <Input placeholder="978-616-xxxxxxx (hyphens will be removed)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="publishedYear"
              label="Published Year"
              rules={[
                {
                  validator: (_: any, value: any) => {
                    if (value === undefined || value === null || value === "")
                      return Promise.resolve();
                    const y = Number(value);
                    return Number.isFinite(y) &&
                      y >= 1000 &&
                      y <= 2100 &&
                      String(y).length === 4
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Enter a 4-digit year (1000–2100)")
                        );
                  },
                },
              ]}
            >
              <Input type="number" placeholder="e.g. 2024" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="synopsis" label="Synopsis">
          <Input.TextArea rows={4} placeholder="Short description…" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="cover" label="Cover Image">
              <Upload
                name="file"
                action={`${API}/upload/cover`}
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                maxCount={1}
                fileList={coverList}
                onChange={({ file, fileList }) => {
                  // สำคัญ: อัปเดต URL ให้กับไฟล์ และเก็บลง hidden field
                  if (file.status === "done") {
                    const url = fileUrl(file);
                    if (url) {
                      (file as any).url = url;
                      form.setFieldsValue({ cover_url: url });
                      msg.success("Cover uploaded.");
                    } else {
                      msg.warning("Upload success but no URL returned.");
                    }
                  } else if (file.status === "error") {
                    msg.error("Cover upload failed.");
                  }
                  setCoverList([...fileList]);
                }}
              >
                <Button>Choose File</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ebook" label="E-Book File">
              <Upload
                name="file"
                action={`${API}/upload/ebook`}
                accept=".pdf,.epub,application/pdf,application/epub+zip"
                maxCount={1}
                fileList={ebookList}
                onChange={async ({ file, fileList }) => {
                  if (file.status === "done") {
                    const url = fileUrl(file);
                    if (url) {
                      (file as any).url = url;
                      form.setFieldsValue({ file_url: url });
                      const guess = detectTypeName(file);
                      if (guess) {
                        const id = await ensureFileTypeByName(guess);
                        setDetectedFileTypeId(id);
                        msg.success(`Detected file type: ${guess}`);
                      } else {
                        setDetectedFileTypeId(undefined);
                        msg.warning(
                          "Cannot detect file type, please upload a .pdf or .epub file."
                        );
                      }
                    } else {
                      msg.warning("Upload success but no URL returned.");
                    }
                  } else if (file.status === "error") {
                    msg.error("E-book upload failed.");
                  }
                  setEbookList([...fileList]);
                }}
              >
                <Button>Choose File</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: ORANGE, borderColor: ORANGE }}
            >
              Update Book
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditBook;
