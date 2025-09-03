// src/pages/book/add/index.tsx
import { useEffect, useRef, useState } from "react";
import { Form, Input, Button, Upload, Select, Row, Col, message, Modal } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { BaseSelectRef } from "rc-select";

import {
  authorAPI,
  publisherAPI,
  languageAPI,
  fileTypeAPI,
  bookAPI,
  bookAuthorAPI,
} from "../../../../services/https/book";

import type { Author, Publisher, Language, FileType } from "../../../../interfaces";

const { Option } = Select;
const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:8088";
const ORANGE = "#f57c00";

const AddBook = () => {
  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();

  // options
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);

  // files
  const [coverList, setCoverList] = useState<UploadFile[]>([]);
  const [ebookList, setEbookList] = useState<UploadFile[]>([]);

  // file type (auto-detected)
  const [detectedFileTypeId, setDetectedFileTypeId] = useState<number | undefined>(undefined);

  // watchers (โหมด tags แต่บังคับ single)
  const publisherV = Form.useWatch("publisher", form);
  const languageV  = Form.useWatch("language", form);

  // ------ blur caret หลังเลือก ------
  type SelectRef = React.MutableRefObject<BaseSelectRef | null>;
  const publisherRef: SelectRef = useRef<BaseSelectRef | null>(null);
  const languageRef:  SelectRef = useRef<BaseSelectRef | null>(null);
  const blurLater = (ref: SelectRef) => setTimeout(() => ref.current?.blur(), 0);

  // helpers -------------------------------------------------
  const fileUrl = (f?: UploadFile): string | undefined => {
    if (!f) return undefined;
    const r: any = (f as any).response;
    return r?.url ?? f.url ?? (r?.id ? `/uploads/${r.id}` : undefined);
  };
  const isNumericId = (v: any) => /^\d+$/.test(String(v));
  const normalizeSingle = (v: any) =>
    (Array.isArray(v) ? v.filter(x => String(x ?? "").trim() !== "").at(-1) : v);
  const findByNames = (list: any[], name: string, keys: string[]) =>
    list.find((x) => keys.some((k) => String(x?.[k] ?? "").trim().toLowerCase() === name.trim().toLowerCase()));

  // เดาชนิดไฟล์จาก mimetype/extension -> "pdf" | "epub" | undefined
  const detectTypeName = (file: any): string | undefined => {
    const mime = file?.type || file?.response?.mime || file?.response?.mimetype || file?.response?.contentType;
    if (mime?.includes?.("pdf")) return "pdf";
    if (mime?.includes?.("epub")) return "epub";
    const name: string = file?.name || file?.response?.filename || "";
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "epub") return "epub";
    return undefined;
  };

  // หา/สร้าง file type แล้วคืน id
  const ensureFileTypeByName = async (name: string): Promise<number | undefined> => {
    const hit = (fileTypes as any[]).find(
      (t) => String(t?.TypeName ?? t?.type_name ?? "").toLowerCase() === name.toLowerCase()
    );
    if (hit) return (hit as any).ID ?? (hit as any).id;

    const res = await fileTypeAPI.create({ type_name: name } as any);
    const created = (res?.data ?? res) as any;
    if (created) setFileTypes((prev) => [...prev, created]);
    return created?.ID ?? created?.id;
  };

  useEffect(() => {
    Promise.all([authorAPI.getAll(), publisherAPI.getAll(), languageAPI.getAll(), fileTypeAPI.getAll()])
      .then(([a, p, l, f]) => {
        setAuthors(Array.isArray(a) ? a : []);
        setPublishers(Array.isArray(p) ? p : []);
        setLanguages(Array.isArray(l) ? l : []);
        setFileTypes(Array.isArray(f) ? f : []);
      })
      .catch(() => msgApi.error("Failed to load dropdown options"));
  }, []);

  // ---------- ensure & return IDs ----------
  const ensureOneAuthorId = async (v: any): Promise<number | undefined> => {
    if (v == null || String(v).trim() === "") return undefined;
    if (isNumericId(v)) return Number(v);
    const name = String(v);
    const hit = findByNames(authors as any[], name, ["AuthorName", "author_name", "Name", "name"]);
    if (hit) return (hit as any).ID ?? (hit as any).id;

    const res = await authorAPI.create({ author_name: name } as any);
    if (!res || (res.status !== 201 && res.status !== 200)) {
      msgApi.error(res?.data?.error || "Failed to create author");
      return undefined;
    }
    const created = res.data || res;
    setAuthors((prev) => [...prev, created]);
    return created.ID ?? created.id;
  };

  const ensureAuthorIds = async (vals: any): Promise<number[]> => {
    const arr = Array.isArray(vals) ? vals : vals == null || String(vals).trim() === "" ? [] : [vals];
    const out: number[] = [];
    for (const v of arr) {
      const id = await ensureOneAuthorId(v);
      if (id) out.push(id);
    }
    return Array.from(new Set(out));
  };

  const ensurePublisherId = async (raw: any): Promise<number | undefined> => {
    const val = normalizeSingle(raw);
    if (val == null || String(val).trim() === "") return undefined;
    if (isNumericId(val)) return Number(val);
    const name = String(val);
    const hit = findByNames(publishers as any[], name, ["PublisherName", "publisher_name", "Name", "name"]);
    if (hit) return (hit as any).ID ?? (hit as any).id;

    const res = await publisherAPI.create({ publisher_name: name } as any);
    if (!res || (res.status !== 201 && res.status !== 200)) {
      msgApi.error(res?.data?.error || "Failed to create publisher");
      return undefined;
    }
    const created = res.data || res;
    setPublishers((prev) => [...prev, created]);
    return created.ID ?? created.id;
  };

  const ensureLanguageId = async (raw: any): Promise<number | undefined> => {
    const val = normalizeSingle(raw);
    if (val == null || String(val).trim() === "") return undefined;
    if (isNumericId(val)) return Number(val);
    const name = String(val);
    const hit = findByNames(languages as any[], name, ["Name", "name"]);
    if (hit) return (hit as any).ID ?? (hit as any).id;

    const res = await languageAPI.create({ name } as any);
    if (!res || (res.status !== 201 && res.status !== 200)) {
      msgApi.error(res?.data?.error || "Failed to create language");
      return undefined;
    }
    const created = res.data || res;
    setLanguages((prev) => [...prev, created]);
    return created.ID ?? created.id;
  };

  const handleFinish = async (values: any) => {
    try {
      const isbnStr =
        values?.isbn && String(values.isbn).trim() !== "" ? String(values.isbn).replace(/-/g, "") : undefined;

      const coverUrl = values?.cover_url ?? fileUrl(coverList[0]);
      const ebookUrl = values?.file_url ?? fileUrl(ebookList[0]);

      // file_type_id จากไฟล์
      let fileTypeId = detectedFileTypeId;
      if (!fileTypeId && ebookList[0]) {
        const guess = detectTypeName(ebookList[0]);
        if (guess) fileTypeId = await ensureFileTypeByName(guess);
      }
      if (!fileTypeId) {
        msgApi.error("Cannot detect file type from e-book file. Please upload a .pdf or .epub file.");
        return;
      }

      const [authorIds, publisherId, languageId] = await Promise.all([
        ensureAuthorIds(values.authors),
        ensurePublisherId(values.publisher),
        ensureLanguageId(values.language),
      ]);

      const payloadApi = {
        title: values.title?.trim(),
        isbn: isbnStr,
        total_page: values?.totalPages ? Number(values.totalPages) : undefined,
        synopsis: values?.synopsis?.trim() || undefined,
        publisher_id: publisherId,
        file_type_id: fileTypeId,
        language_id: languageId,
        cover_image: coverUrl,
        ebook_file: ebookUrl,
        published_year: values?.publishedYear ? Number(values.publishedYear) : undefined,
      };

      const res = await bookAPI.create(payloadApi as any);
      if (!res || (res.status !== 201 && res.status !== 200)) {
        return msgApi.error(res?.data?.error || "Failed to save book");
      }

      const book = res.data;
      const bookId = book?.ID ?? book?.id;
      if (!bookId) return msgApi.error("Book ID not found after create");

      if (authorIds.length) {
        await Promise.all(
          authorIds.map((aid) => bookAuthorAPI.add({ book_id: Number(bookId), author_id: Number(aid) }))
        );
      }

      modal.success({
        title: "Success",
        content: "The book has been added successfully.",
        okText: "OK",
        okButtonProps: { style: { backgroundColor: ORANGE, borderColor: ORANGE } },
        onOk: () => {
          form.resetFields();
          setCoverList([]);
          setEbookList([]);
          setDetectedFileTypeId(undefined);
        },
      });
    } catch (e) {
      console.error(e);
      msgApi.error("An unexpected error occurred");
    }
  };

  // validation rules
  const yearRule = {
    validator: (_: any, value: any) => {
      if (value === undefined || value === null || String(value).trim() === "") return Promise.resolve();
      const y = Number(value);
      return Number.isFinite(y) && y >= 1000 && y <= 2100 && String(y).length === 4
        ? Promise.resolve()
        : Promise.reject(new Error("Enter a 4-digit year (1000–2100)"));
    },
  };
  const authorRequiredRule = {
    validator: (_: any, value: any) => {
      const arr = Array.isArray(value) ? value : value ? [value] : [];
      return arr.length ? Promise.resolve() : Promise.reject(new Error("Please provide at least one author"));
    },
  };

  // keep latest tag (single)
  const keepLast = (field: "publisher" | "language") => (vals: any[]) => {
    const last = vals?.length ? [vals.at(-1)] : [];
    form.setFieldsValue({ [field]: last });
  };

  return (
    <div style={{ padding: "8px 24px 24px 24px" , margin:"24px", background: "#fff", borderRadius: 8 }}>
      {contextHolder}
      {modalHolder}

      <h2 style={{ fontWeight: "bold", marginBottom: 24, fontSize: 28 }}>Add Book</h2>

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        {/* hidden fields for upload URLs */}
        <Form.Item name="cover_url" hidden><Input /></Form.Item>
        <Form.Item name="file_url" hidden><Input /></Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter a title" }]}>
              <Input placeholder="Enter book title" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="authors" label="Authors" rules={[authorRequiredRule as any]}>
              <Select
                mode="tags"
                tokenSeparators={[","]}
                placeholder="Type author names (comma separated) or pick from the list"
                optionFilterProp="children"
                maxTagCount="responsive"
              >
                {authors.map((a) => {
                  const id = (a as any).ID ?? (a as any).id;
                  const name =
                    (a as any).AuthorName ?? (a as any).author_name ?? (a as any).Name ?? (a as any).name;
                    return (
                      <Option key={String(id)} value={String(id)}>
                        {name}
                      </Option>
                    );
                })}
              </Select>
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
                optionFilterProp="children"
                value={publisherV}
                onChange={(vals) => { keepLast("publisher")(vals as any[]); blurLater(publisherRef); }}
                onSelect={() => blurLater(publisherRef)}
              >
                {publishers.map((p) => {
                  const id = (p as any).ID ?? (p as any).id;
                  const name =
                    (p as any).PublisherName ?? (p as any).publisher_name ?? (p as any).Name ?? (p as any).name;
                  return (
                    <Option key={String(id)} value={String(id)}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="language" label="Language" rules={[{ required: true, message: "Please provide a language" }]}>
              <Select
                ref={languageRef}
                mode="tags"
                tokenSeparators={[","]}
                placeholder="Type a language or pick from the list"
                optionFilterProp="children"
                value={languageV}
                onChange={(vals) => { keepLast("language")(vals as any[]); blurLater(languageRef); }}
                onSelect={() => blurLater(languageRef)}
              >
                {languages.map((l) => {
                  const id = (l as any).ID ?? (l as any).id;
                  const name = (l as any).Name ?? (l as any).name;
                  return (
                    <Option key={String(id)} value={String(id)}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="totalPages" label="Total Pages" rules={[{ required: true, message: "Please enter total pages" }]}>
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
            <Form.Item name="publishedYear" label="Published Year" rules={[yearRule as any]}>
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
                accept=".png,.jpg,.jpeg,.webp"
                maxCount={1}
                fileList={coverList}
                onChange={({ file, fileList }) => {
                  setCoverList(fileList);
                  if (file.status === "done") {
                    const url = fileUrl(file);
                    if (url) form.setFieldsValue({ cover_url: url });
                    msgApi.success("Cover uploaded");
                  } else if (file.status === "error") {
                    msgApi.error("Cover upload failed");
                  }
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
                accept=".pdf,.epub"
                maxCount={1}
                fileList={ebookList}
                onChange={async ({ file, fileList }) => {
                  setEbookList(fileList);
                  if (file.status === "done") {
                    const url = fileUrl(file);
                    if (url) form.setFieldsValue({ file_url: url });

                    const guess = detectTypeName(file);
                    if (guess) {
                      const id = await ensureFileTypeByName(guess);
                      setDetectedFileTypeId(id);
                      msgApi.success(`Detected file type: ${guess}`);
                    } else {
                      setDetectedFileTypeId(undefined);
                      msgApi.warning("Cannot detect file type, please upload a .pdf or .epub file.");
                    }
                  } else if (file.status === "error") {
                    msgApi.error("E-book upload failed");
                  }
                }}
              >
                <Button>Choose File</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* ไม่มีช่อง File Type แล้ว */}

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button htmlType="button" onClick={() => form.resetFields()}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: ORANGE, borderColor: ORANGE }}>
              Save Book
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddBook;