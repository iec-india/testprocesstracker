import { formatDate, getProcessStyle, parseAttachmentUrls } from './historyUtils';

export function SubmissionCards({ viewMode, error, loading, filteredSubmissions }) {
  const showCards = viewMode !== 'process-indicators';

  if (!showCards) {
    return null;
  }

  let content = null;

  if (loading) {
    content = (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
        Loading your history...
      </div>
    );
  } else if (filteredSubmissions.length === 0) {
    content = (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
        No matching submissions found for selected filters.
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredSubmissions.map((item) => {
          const attachments = parseAttachmentUrls(item.attachment_url);
          const gpReceipt = item.gp_receipt_url ? [String(item.gp_receipt_url).trim()] : [];
          const allImages = [...attachments, ...gpReceipt];
          const locationNodes = [item.state, item.district, item.block, item.cluster, item.gram_panchayat].filter(Boolean);
          const processStyle = getProcessStyle(item.process_type || 'Unknown');

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${processStyle.card}`}
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-current/90">
                    {formatDate(item.date || item.created_at)}
                  </p>
                  {item.selected_name && (
                    <p className="text-xs font-medium text-current/80">{item.selected_name}</p>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {item.process_type && (
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${processStyle.badge}`}>
                      {item.process_type}
                    </span>
                  )}
                </div>
              </div>

              {locationNodes.length > 0 && (
                <div className="mb-4 mt-3 rounded-xl border border-slate-100/20 bg-slate-50/20 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {locationNodes.map((node, index) => (
                      <div key={`${node}-${index}`} className="flex min-w-0 items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-current/40" />
                          <span className="break-words text-xs font-semibold text-current">{node}</span>
                        </div>
                        {index < locationNodes.length - 1 && (
                          <span className="text-[10px] font-semibold text-current/50">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 flex flex-col gap-2">
                {item.teachers_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-current/90">Teacher:</span>
                    <span className="text-xs font-medium text-current/80">{item.teachers_name}</span>
                  </div>
                )}
              </div>

              {allImages.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-current/80">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {allImages.map((url, index) => (
                      <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="group inline-block">
                        <img
                          src={url}
                          alt={`Attachment ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          width="48"
                          height="48"
                          className="h-12 w-12 rounded-lg border border-slate-200 object-cover transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
                <div className="font-medium text-slate-500">
                  {item.gram_panchayat && (
                    <span className="inline-block rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                      GP: {item.gram_panchayat}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-200/30 sm:rounded-3xl sm:p-6">
      {!viewMode ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          Select a report type above to see the saved submissions.
        </div>
      ) : error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {content}
    </div>
  );
}
